async function getNeetcodeProblems() {
  // NeetCode's internal API — used by neetcode.io itself
  const res = await fetch("https://neetcode.io/api/problems");
  if (!res.ok) throw new Error(`API failed: ${res.status}`);
  return await res.json();
}

async function main() {
  let problems;
  try {
    problems = await getNeetcodeProblems();
  } catch (err) {
    console.error("❌ Failed to fetch problems:", err.message);
    process.exit(1);
  }

  const problem = problems[Math.floor(Math.random() * problems.length)];

  const difficulty = problem.difficulty;
  const title = problem.name || problem.title;
  const slug = problem.slug || problem.link;

  const difficultyColors = { Easy: 0x00b8a9, Medium: 0xf9a825, Hard: 0xe53935 };
  const difficultyEmoji = { Easy: "🟢", Medium: "🟡", Hard: "🔴" };

  const payload = {
    embeds: [{
      title: `📌 Daily NeetCode Challenge`,
      description: [
        `### [${title}](https://neetcode.io/problems/${slug})`,
        `**Difficulty:** ${difficultyEmoji[difficulty]} ${difficulty}`,
        `**LeetCode:** [Solve here](https://leetcode.com/problems/${slug})`,
      ].join("\n"),
      color: difficultyColors[difficulty] ?? 0x5865f2,
      footer: { text: "Good luck! 💪 Try to solve it before checking the solution." },
      timestamp: new Date().toISOString(),
    }]
  };

  const webhookRes = await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  console.log(webhookRes.ok ? `✅ Sent: ${title}` : `❌ Webhook failed: ${webhookRes.status}`);
}

main();