async function getNeetcodeProblems() {
  // NeetCode's own roadmap data, pulled directly from their open-source repo
  const url = "https://raw.githubusercontent.com/neetcode-gh/leetcode/main/README.md";
  const res = await fetch(url);
  const text = await res.text();

  // Parse markdown table rows like: | Two Sum | [Solution] | Easy |
  const problems = [];
  const regex = /\|\s*\[([^\]]+)\]\(https:\/\/leetcode\.com\/problems\/([^)]+)\)[^|]*\|[^|]*\|\s*(Easy|Medium|Hard)\s*\|/g;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const [, title, slug, difficulty] = match;
    problems.push({
      title,
      url: `https://neetcode.io/problems/${slug}`,
      leetcodeUrl: `https://leetcode.com/problems/${slug}`,
      difficulty,
    });
  }

  return problems;
}

async function main() {
  const problems = await getNeetcodeProblems();

  if (!problems.length) {
    console.error("❌ Failed to fetch problems");
    process.exit(1);
  }

  const problem = problems[Math.floor(Math.random() * problems.length)];

  const difficultyColors = { Easy: 0x00b8a9, Medium: 0xf9a825, Hard: 0xe53935 };
  const difficultyEmoji = { Easy: "🟢", Medium: "🟡", Hard: "🔴" };

  const payload = {
    embeds: [{
      title: `📌 Daily LeetCode Challenge`,
      description: [
        `### [${problem.title}](${problem.leetcodeUrl})`,
        `**Difficulty:** ${difficultyEmoji[problem.difficulty]} ${problem.difficulty}`,
        `**NeetCode solution:** [Watch here](${problem.url})`,
      ].join("\n"),
      color: difficultyColors[problem.difficulty],
      footer: { text: "Good luck! 💪 Try to solve it before checking the solution." },
      timestamp: new Date().toISOString(),
    }]
  };

  const res = await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  console.log(res.ok ? `✅ Sent: ${problem.title}` : `❌ Failed: ${res.status}`);
}

main();
