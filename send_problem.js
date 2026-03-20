async function getNeetcodeProblems() {
  const res = await fetch(
    "https://raw.githubusercontent.com/neetcode-gh/leetcode/main/.problemSiteData.json"
  );
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.filter(p => p.neetcode150);
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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

  const byDifficulty = {
    Easy: problems.filter(p => p.difficulty === "Easy"),
    Medium: problems.filter(p => p.difficulty === "Medium"),
    Hard: problems.filter(p => p.difficulty === "Hard"),
  };

  const difficultyColors = { Easy: 0x00b8a9, Medium: 0xf9a825, Hard: 0xe53935 };
  const difficultyEmoji = { Easy: "🟢", Medium: "🟡", Hard: "🔴" };

  const embeds = ["Easy", "Medium", "Hard"].map(difficulty => {
    const problem = pickRandom(byDifficulty[difficulty]);
    const slug = problem.link.replace(/\/$/, "");
    return {
      description: [
        `### [${problem.problem}](https://leetcode.com/problems/${slug})`,
        `**Category:** ${problem.pattern}`,
        `**Difficulty:** ${difficultyEmoji[difficulty]} ${difficulty}`,
      ].join("\n"),
      color: difficultyColors[difficulty],
    };
  });

  // Add header to first embed, footer to last
  embeds[0].title = "📌 Daily LeetCode Challenges";
  embeds[2].footer = { text: "Good luck! 💪 Try to solve them before checking the solutions." };
  embeds[2].timestamp = new Date().toISOString();

  const payload = { embeds };

  const webhookRes = await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  console.log(webhookRes.ok ? "✅ Sent!" : `❌ Webhook failed: ${webhookRes.status}`);
}

main();