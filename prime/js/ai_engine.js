// ========================
// AI Engine (Local Intelligence)
// ========================

const AI_Engine = {
    // 1. Smart Logging Parser
    parseLogInput: function (text, appData) {
        text = text.toLowerCase();

        // Detect Skill from dynamic data
        const dynamicSkills = [
            ...(appData.classes || []).map(c => c.name),
            ...(appData.work || []).map(w => w.name)
        ];

        let detectedSkill = "Other";
        for (let skill of dynamicSkills) {
            if (text.includes(skill.toLowerCase())) {
                detectedSkill = skill;
                break;
            }
        }

        // Suggestion Logic for Unknown Skills
        let suggestion = null;
        if (detectedSkill === "Other" && (text.includes("studied") || text.includes("worked on") || text.includes("practicing"))) {
            // Very simple heuristic to find the potential skill name
            const words = text.split(' ');
            const index = words.findIndex(w => ["studied", "practicing", "on"].includes(w));
            if (index !== -1 && words[index + 1]) {
                suggestion = words[index + 1].charAt(0).toUpperCase() + words[index + 1].slice(1);
            }
        }

        // Detect Duration (e.g., 2h, 2.5 hours, 30 mins)
        let hours = 0;
        const hourMatch = text.match(/(\d+(\.\d+)?)\s*(h|hr|hour|hours)/);
        const minMatch = text.match(/(\d+)\s*(m|min|mins|minute|minutes)/);

        if (hourMatch) {
            hours += parseFloat(hourMatch[1]);
        }
        if (minMatch) {
            hours += parseFloat(minMatch[1]) / 60;
        }

        // Default to 1 hour if no time specified but intention is clear
        if (hours === 0 && (text.includes("studied") || text.includes("practiced") || text.includes("worked on"))) {
            hours = 1;
        }

        // Detect Date (Simplified)
        let date = new Date().toISOString(); // Default to now
        if (text.includes("yesterday")) {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            date = d.toISOString();
        }

        return {
            valid: hours > 0,
            entry: {
                id: Date.now(),
                date: date,
                skill: detectedSkill,
                hours: parseFloat(hours.toFixed(2)),
                notes: text
            },
            suggestion: suggestion
        };
    },

    // 2. Generate Daily Insight
    generateDailyInsight: function (skillsData) {
        // Filter for today's logs
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = skillsData.filter(log => log.date.startsWith(today));

        if (todayLogs.length === 0) {
            return "No activity logged yet today. What's your focus?";
        }

        // Calculate totals
        let totalHours = 0;
        let skillCounts = {};

        todayLogs.forEach(log => {
            totalHours += log.hours;
            skillCounts[log.skill] = (skillCounts[log.skill] || 0) + log.hours;
        });

        // Find top skill
        let topSkill = Object.keys(skillCounts).length > 0 ? Object.keys(skillCounts).reduce((a, b) => skillCounts[a] > skillCounts[b] ? a : b) : "Focus";

        // Predictive: Check for neglected skills (no logs in last 7 days)
        let suggestion = "";
        const now = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);

        const dynamicSkills = [
            ...(appData.classes || []).map(c => c.name),
            ...(appData.work || []).map(w => w.name)
        ];

        const recentSkills = new Set(skillsData.filter(log => new Date(log.date) >= weekAgo).map(log => log.skill));
        const neglected = dynamicSkills.filter(s => !recentSkills.has(s));

        if (neglected.length > 0) {
            suggestion = ` Hint: You haven't touched ${neglected[0]} in a week. Maybe a quick session tomorrow?`;
        }

        // Generate message
        if (totalHours > 4) {
            return `Impressive! ${totalHours.toFixed(1)} hours today. You're crushing ${topSkill}.${suggestion}`;
        } else if (totalHours > 1) {
            return `Good start! ${totalHours.toFixed(1)} hours logged. Focused mainly on ${topSkill}.${suggestion}`;
        } else if (totalHours > 0) {
            return `Started with ${topSkill}. Keep the momentum going!${suggestion}`;
        } else {
            return `No activity yet today. ${neglected.length > 0 ? `How about starting with ${neglected[0]}?` : "What's the plan for today?"}`;
        }
    },

    // 2.1 Weekly Reflection
    generateWeeklyInsight: function (skillsData) {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
        const weekLogs = skillsData.filter(log => new Date(log.date) >= startOfWeek);

        if (weekLogs.length === 0) return "No activity logged this week yet.";

        let totalHours = 0;
        let focusSessions = 0;
        const skillTotals = {};

        weekLogs.forEach(log => {
            totalHours += log.hours;
            if (log.focusSession) focusSessions++;
            skillTotals[log.skill] = (skillTotals[log.skill] || 0) + log.hours;
        });

        const skillKeys = Object.keys(skillTotals);
        const topSkill = skillKeys.length > 0 ? skillKeys.reduce((a, b) => skillTotals[a] > skillTotals[b] ? a : b) : "Focus";
        const imbalanceThreshold = totalHours * 0.7;
        let imbalanceMsg = "";

        if (skillTotals[topSkill] > imbalanceThreshold && skillKeys.length > 1) {
            imbalanceMsg = ` Warning: You've spent over 70% of your time on ${topSkill}. Try to balance other skills.`;
        }

        let msg = `This week: ${totalHours.toFixed(1)}h total. ${topSkill} is your top focus.${imbalanceMsg} `;
        if (focusSessions > 2) {
            msg += `Excellent energy! ${focusSessions} Deep Work blocks found. You're in high-momentum territory.`;
        } else {
            msg += `Action item: Your best focus usually comes early in the week. Plan a 90min block for tomorrow.`;
        }
        return msg;
    },

    // 2.2 Heatmap Data Generator (Yearly)
    generateHeatmapData: function (skillsData) {
        const heatmap = {};
        const now = new Date();
        const yearAgo = new Date();
        yearAgo.setDate(now.getDate() - 364);

        (skillsData || []).forEach(log => {
            const dateStr = log.date.split('T')[0];
            heatmap[dateStr] = (heatmap[dateStr] || 0) + log.hours;
        });

        const data = [];
        for (let i = 0; i <= 364; i++) {
            const d = new Date(yearAgo);
            d.setDate(yearAgo.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const hours = heatmap[dateStr] || 0;
            let level = 0;
            if (hours > 6) level = 4;
            else if (hours > 4) level = 3;
            else if (hours > 2) level = 2;
            else if (hours > 0) level = 1;

            data.push({ date: dateStr, level, hours });
        }
        return data;
    },

    // 2.3 Deep Correlation Analysis
    analyzeCorrelations: function (appData) {
        const logs = appData.skills || [];
        if (logs.length < 5) return ["Log more data to uncover deep patterns."];

        const patterns = [];

        // 1. Best Focus Days
        const dayFocus = {};
        logs.forEach(l => {
            const day = new Date(l.date).toLocaleDateString('en-US', { weekday: 'long' });
            if (l.focusSession) {
                dayFocus[day] = (dayFocus[day] || 0) + 1;
            }
        });

        const bestDay = Object.keys(dayFocus).sort((a, b) => dayFocus[b] - dayFocus[a])[0];
        if (bestDay) {
            patterns.push(`Your peak focus concentration is on **${bestDay}s**.`);
        }

        // 2. Procrastination Alerts
        const tasks = appData.tasks || [];
        const highPriorityPending = tasks.filter(t => t.priority === "High" && !t.completed).length;
        if (highPriorityPending > 3) {
            patterns.push(`High-priority task pressure is building. Focus score might drop if not addressed.`);
        }

        // 3. Neglect Shift
        const skillsCount = {};
        logs.forEach(l => skillsCount[l.skill] = (skillsCount[l.skill] || 0) + l.hours);
        const topSkill = Object.keys(skillsCount).sort((a, b) => skillsCount[b] - skillsCount[a])[0];

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentLogs = logs.filter(l => new Date(l.date) >= weekAgo);
        const recentTop = recentLogs.length > 0 ? [...new Set(recentLogs.map(l => l.skill))][0] : null;

        if (recentTop && recentTop !== topSkill) {
            patterns.push(`Observed shift: Your focus has moved from **${topSkill}** to **${recentTop}** recently.`);
        }

        return patterns.length > 0 ? patterns : ["Staying consistent. No anomalies detected yet."];
    },

    // 2.3 Predictive Scheduling
    predictSchedule: function (appData) {
        const now = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);

        const skills = [
            ...(appData.classes || []).map(c => c.name),
            ...(appData.work || []).map(w => w.name)
        ];

        const logs = appData.skills || [];
        const recentLogCounts = {};
        skills.forEach(s => recentLogCounts[s] = 0);

        logs.filter(l => new Date(l.date) >= weekAgo).forEach(l => {
            if (recentLogCounts[l.skill] !== undefined) recentLogCounts[l.skill] += l.hours;
        });

        // Find neglected
        const neglected = skills.sort((a, b) => recentLogCounts[a] - recentLogCounts[b])[0];
        if (!neglected) return "Add some skills to get personalized schedules!";

        // Find gaps (Simple: assume 2h blocks)
        const day = now.toLocaleDateString('en-US', { weekday: 'long' });
        const dayEntries = appData.timetable.filter(e => e.day === day);

        if (dayEntries.length === 0) {
            return `Today is wide open. Suggested focus: 2h for **${neglected}**.`;
        }

        return `Based on your timetable, you have a gap after your ${dayEntries[dayEntries.length - 1].subject} class. Perfect for 90min of **${neglected}**.`;
    },


    // 2.2 Monthly Reflection
    generateMonthlyInsight: function (skillsData) {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 28);

        const monthLogs = skillsData.filter(log => new Date(log.date) >= monthAgo);

        if (monthLogs.length === 0) return "No data for the past 28 days. Time to build some momentum!";

        let totalHours = 0;
        let activeDays = new Set();
        const skillTotals = {};

        monthLogs.forEach(log => {
            totalHours += log.hours;
            activeDays.add(new Date(log.date).toLocaleDateString());
            skillTotals[log.skill] = (skillTotals[log.skill] || 0) + log.hours;
        });

        // Detect major shift or neglected skills
        const skillKeys = Object.keys(skillTotals);
        const topSkill = skillKeys.length > 0 ? skillKeys.reduce((a, b) => skillTotals[a] > skillTotals[b] ? a : b) : "None";
        const consistency = Math.round((activeDays.size / 28) * 100);

        let msg = `Past 4 Weeks: ${totalHours.toFixed(0)}h over ${activeDays.size} days (${consistency}% consistency). `;
        if (topSkill !== "None") msg += `You've mastered the habit of ${topSkill}. `;

        if (consistency < 50) {
            msg += "Try to log at least 30 mins every day to boost your score!";
        } else {
            msg += "Excellent retention!";
            if (window.detectPeakWindow) {
                const peak = window.detectPeakWindow();
                msg += ` Your peak productivity window is between ${peak.start}:00 and ${peak.end}:00.`;
            }
            msg += " Keep pushing your boundaries.";
        }
        return msg;
    },

    // 3. Process Natural Query
    processQuery: function (text, appData) {
        text = text.toLowerCase();

        // 1. Best Day Query
        if (text.includes("best day") || text.includes("trend")) {
            const weeklyLogs = appData.skills.filter(log => {
                const d = new Date(log.date);
                const startOfWeek = new Date();
                const day = startOfWeek.getDay();
                const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
                startOfWeek.setDate(diff);
                startOfWeek.setHours(0, 0, 0, 0);
                return d >= startOfWeek;
            });

            if (weeklyLogs.length === 0) return "You haven't logged any hours this week yet.";

            const dayCounts = {};
            weeklyLogs.forEach(log => {
                const d = new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' });
                dayCounts[d] = (dayCounts[d] || 0) + log.hours;
            });

            const bestDay = Object.keys(dayCounts).reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b);
            return `Your most productive day this week was ${bestDay} with ${dayCounts[bestDay].toFixed(1)}h.`;
        }

        // 1.1 Correlation/Analytic Query
        if (text.includes("pattern") || text.includes("correlate") || text.includes("insight")) {
            const results = this.analyzeCorrelations(appData);
            return "Latest Insights: " + results.join(" | ");
        }

        if (text.includes("heatmap") || text.includes("year")) {
            return "I've updated your activity heatmap. You can see your consistency intensity over the last 365 days in the Deep Insights section.";
        }

        // 2. Consistency Score Query
        if (text.includes("consistency") || text.includes("score")) {
            if (window.calculateConsistencyScore) {
                const results = window.calculateConsistencyScore();
                return `Your consistency score for this month is ${results.percentage}% (Grade: ${results.grade}). You have ${results.activeDays} active days.`;
            }
            return "Consistency engine is still warming up. Try again in a second!";
        }

        // 3. Skill Specific Monthly Hours
        const skillMatch = text.match(/(?:hours|time|long).*? (?:on|for) (.*?) (?:this month|monthly)/);
        if (skillMatch) {
            const targetSkill = skillMatch[1].trim();
            const monthAgo = new Date();
            monthAgo.setDate(monthAgo.getDate() - 28);

            const total = appData.skills
                .filter(log => log.skill.toLowerCase() === targetSkill && new Date(log.date) >= monthAgo)
                .reduce((sum, log) => sum + log.hours, 0);

            return `You've spent a total of ${total.toFixed(1)}h on ${targetSkill} over the last 4 weeks.`;
        }

        // 4. Neglect Query (Multi-step reasoning)
        if (text.includes("neglect") || text.includes("missed") || text.includes("forgot")) {
            const now = new Date();
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);

            const dynamicSkills = [
                ...(appData.classes || []).map(c => c.name),
                ...(appData.work || []).map(w => w.name)
            ];

            const recentSkills = new Set(appData.skills.filter(log => new Date(log.date) >= weekAgo).map(log => log.skill));
            const neglected = dynamicSkills.filter(s => !recentSkills.has(s));

            if (neglected.length > 0) {
                return `Based on last 7 days, you've neglected: ${neglected.join(', ')}. Should we plan a session?`;
            }
            return "You're all caught up! No tracked skills have been neglected in the last week.";
        }

        // 5. Top Focus Sessions
        if (text.includes("top sessions") || text.includes("best focus") || text.includes("sessions this month")) {
            const focusSessions = appData.skills
                .filter(log => log.focusSession)
                .sort((a, b) => b.hours - a.hours)
                .slice(0, 3);

            if (focusSessions.length === 0) return "I couldn't find any Deep Work sessions logged. Aim for a block ≥ 1.5h!";

            let resp = "Your top focus sessions were:";
            focusSessions.forEach((s, i) => {
                const d = new Date(s.date).toLocaleDateString();
                resp += `\n${i + 1}. ${s.skill} (${s.hours}h) on ${d}`;
            });
            return resp;
        }

        // 6. Focus Score Query
        if (text.includes("focus score") || text.includes("focus grade")) {
            if (window.calculateConsistencyScore) {
                const results = window.calculateConsistencyScore();
                return `Your Focus Score is ${results.focusScore}%. This represents the ratio of Deep Work sessions to total time logged.`;
            }
        }

        // 7. Peak Focus Query
        if (text.includes("peak focus") || text.includes("best time") || text.includes("peak window")) {
            if (window.detectPeakWindow) {
                const peak = window.detectPeakWindow();
                return `Based on your logging history, your peak focus window is between ${peak.start}:00 and ${peak.end}:00.`;
            }
        }

        // 8. Predictive Query
        if (text.includes("suggest") || text.includes("plan") || text.includes("schedule")) {
            return this.predictSchedule(appData);
        }

        // 9. Trend Query (Largest Drop)
        if (text.includes("drop") || text.includes("less") || text.includes("decrease")) {
            // Compare this week vs last week
            const now = new Date();
            const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1));
            const lastWeekStart = new Date(new Date(thisWeekStart).setDate(thisWeekStart.getDate() - 7));

            const thisWeekLogs = appData.skills.filter(l => new Date(l.date) >= thisWeekStart);
            const lastWeekLogs = appData.skills.filter(l => new Date(l.date) >= lastWeekStart && new Date(l.date) < thisWeekStart);

            const getTotals = (logs) => {
                const t = {};
                logs.forEach(l => t[l.skill] = (t[l.skill] || 0) + l.hours);
                return t;
            };

            const thisT = getTotals(thisWeekLogs);
            const lastT = getTotals(lastWeekLogs);

            let biggestDrop = { skill: null, diff: 0 };
            for (let s in lastT) {
                const diff = lastT[s] - (thisT[s] || 0);
                if (diff > biggestDrop.diff) biggestDrop = { skill: s, diff };
            }

            if (biggestDrop.skill) {
                return `You've spent ${biggestDrop.diff.toFixed(1)}h less on **${biggestDrop.skill}** this week compared to last. Want to catch up?`;
            }
            return "No significant drops detected. You're staying consistent!";
        }

        if (text.includes("show stats") || text.includes("status")) {
            return "opening_stats";
        }

        return "I can help with trends, consistency, focus scores, peak windows, and neglect detection! Try: 'What did I neglect?'";
    }
};

// Export for use in main script
window.AI_Engine = AI_Engine;
