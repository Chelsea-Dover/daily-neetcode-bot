async function getNeetcodeProblems() {
  const res = await fetch(
    "https://raw.githubusercontent.com/neetcode-gh/leetcode/main/.problemSiteData.json"
  );
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.filter(p => p.neetcode150);
}

async function main() {
  let problems;
  try {
    problems = await getNeetcodeProblems();
  } catch (err) {
    console.error("❌ Failed to fetch problems:", err.message);
    process.exit(1);
  }

  if (problems.length === 0) {
    console.error("❌ No problems found after filtering");
    process.exit(1);
  }

  const problem = problems[Math.floor(Math.random() * problems.length)];
  const slug = problem.link.replace(/\/$/, ""); // strip trailing slash

  const difficultyColors = { Easy: 0x00b8a9, Medium: 0xf9a825, Hard: 0xe53935 };
  const difficultyEmoji = { Easy: "🟢", Medium: "🟡", Hard: "🔴" };

  const payload = {
    embeds: [{
      title: `📌 Daily NeetCode Challenge`,
      description: [
        `### [${problem.problem}](https://neetcode.io/problems/${slug})`,
        `**Category:** ${problem.pattern}`,
        `**Difficulty:** ${difficultyEmoji[problem.difficulty]} ${problem.difficulty}`,
        `**LeetCode:** [Solve here](https://leetcode.com/problems/${slug})`,
      ].join("\n"),
      color: difficultyColors[problem.difficulty] ?? 0x5865f2,
      footer: { text: "Good luck! 💪 Try to solve it before checking the solution." },
      timestamp: new Date().toISOString(),
    }]
  };

  const webhookRes = await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  console.log(webhookRes.ok ? `✅ Sent: ${problem.problem}` : `❌ Webhook failed: ${webhookRes.status}`);
}

main();