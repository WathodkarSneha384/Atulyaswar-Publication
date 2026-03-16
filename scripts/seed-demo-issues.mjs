import fs from "node:fs";

const envLines = fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean);
const adminKey = (envLines.find((line) => line.startsWith("MANUSCRIPT_ADMIN_KEY=")) ?? "")
  .split("=")[1];

const adminHeaders = {
  "Content-Type": "application/json",
  "x-admin-key": adminKey,
};

const base = "http://localhost:3003";

const issues = [
  {
    year: "2024",
    volume: "13",
    issueNo: "2",
    title: "Vol. 13, No. 2 (July 2024)",
    entries: [
      {
        title: "Raag Khambavati: A Melody Woven through Myth, Migration, and Imagination",
        author: "Dipankar Chakraborty & Sumita Dutta",
        pageNo: "1-17",
        pdfUrl: "https://sangeetgalaxy.co.in/current-journal/",
      },
      {
        title: "Raga Vibhas - A Study",
        author: "Chaitra Sontakke & Arati N. Rao",
        pageNo: "18-30",
        pdfUrl: "https://sangeetgalaxy.co.in/current-journal/",
      },
    ],
  },
  {
    year: "2025",
    volume: "14",
    issueNo: "1",
    title: "Vol. 14, No. 1 (January 2025)",
    entries: [
      {
        title: "Evolving Rhythms and Instruments in Jhumur of West Bengal",
        author: "Swikriti Das & Pintu Saha",
        pageNo: "31-46",
        pdfUrl: "https://sangeetgalaxy.co.in/current-journal/",
      },
      {
        title: "Mapping the Infinite: The Logic of Raga Classification",
        author: "Maneesha Kulkarni",
        pageNo: "54-59",
        pdfUrl: "https://sangeetgalaxy.co.in/current-journal/",
      },
    ],
  },
  {
    year: "2026",
    volume: "15",
    issueNo: "1",
    title: "Vol. 15, No. 1 (January 2026)",
    entries: [
      {
        title: "The Legacy of the Maihar Gharana",
        author: "Sarada Prasan Das",
        pageNo: "148-154",
        pdfUrl: "https://sangeetgalaxy.co.in/current-journal/",
      },
      {
        title: "The Influence of Hindustani and Carnatic Classical Music on Rabindra Sangeet",
        author: "Manas Bhul",
        pageNo: "288-295",
        pdfUrl: "https://sangeetgalaxy.co.in/current-journal/",
      },
    ],
  },
];

const pendingSubmissions = [
  {
    title:
      "Beyond Scale and Structure: Investigating the Cognitive and Aesthetic Foundations of Raga Identity in Hindustani Classical Music",
    author: "Budhaditya Pradhan & Rajesh Shah",
    pageNo: "168-178",
    pdfUrl: "https://sangeetgalaxy.co.in/current-journal/",
    submitterEmail: "author1@example.com",
  },
  {
    title: "How to Add Dyads to a Melody on a Piano or a Keyboard",
    author: "Yash Gupta",
    pageNo: "199-206",
    pdfUrl: "https://sangeetgalaxy.co.in/current-journal/",
    submitterEmail: "author2@example.com",
  },
  {
    title: "Developing Creative Thinking Through Musical Improvisation in Education",
    author: "Renu Gupta & Ravjot Kaur",
    pageNo: "207-217",
    pdfUrl: "https://sangeetgalaxy.co.in/current-journal/",
    submitterEmail: "author3@example.com",
  },
];

async function postJson(url, body, headers = adminHeaders) {
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`${url} -> ${JSON.stringify(data)}`);
  }
  return data;
}

async function run() {
  let currentIssueId = "";

  for (const issue of issues) {
    const created = await postJson(`${base}/api/issues`, {
      year: issue.year,
      volume: issue.volume,
      issueNo: issue.issueNo,
      title: issue.title,
    });

    const issueId = created.item.id;
    currentIssueId = issueId;

    for (const entry of issue.entries) {
      await postJson(`${base}/api/issues/${issueId}/entries`, entry);
    }
  }

  for (const submission of pendingSubmissions) {
    await postJson(
      `${base}/api/issue-entry-submissions`,
      {
        issueId: currentIssueId,
        ...submission,
      },
      { "Content-Type": "application/json" },
    );
  }

  console.log("Seeded 3 issues and 3 pending issue-entry submissions.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
