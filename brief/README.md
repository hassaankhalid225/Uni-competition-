# brief/ — Official Problem Statement Drop Zone

Put the official hackathon problem statement here when it is announced, e.g.:

```
brief/challenge.pdf
brief/annex-dataset.xlsx      # any supplementary material
```

Then start Claude Code in the repository root and run:

```
/hackathon-kickoff brief/challenge.pdf
```

Also tell Claude (if not stated in the brief): total build time, team size, presentation length,
and any rules the organisers announced verbally.

Notes
- PDFs are read fully with `pdftotext -layout` (text PDFs) or page-by-page as images (scanned
  PDFs). Both tools are available in this environment.
- If the brief is confidential, do not commit it: add its filename to `.gitignore` or keep it out
  of `git add`.
- Nothing is built until the brief has been analysed and the team confirms the chosen solution.
