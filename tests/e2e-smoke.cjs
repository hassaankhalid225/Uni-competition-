// End-to-end smoke test of every role's critical flows (40 checks).
// Requires: a freshly seeded DB (npm run db:seed), the app running on :3000 (npm run build && npm start),
// and Playwright available (npm i -D playwright && npx playwright install chromium). Run: node tests/e2e-smoke.cjs
const { chromium } = require('playwright');
const BASE = 'http://localhost:3000';
const results = [];
const ok = (name, cond, extra='') => { results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`); };

async function login(browser, email) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(`${BASE}/login`);
  await page.getByLabel('University email').fill(email);
  await page.getByLabel('Password').fill('campus123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(`${BASE}/`);
  return { ctx, page, errors };
}

(async () => {
  const browser = await chromium.launch();

  // 0. Wrong password
  {
    const ctx = await browser.newContext(); const page = await ctx.newPage();
    await page.goto(`${BASE}/login`);
    await page.getByLabel('University email').fill('student@campus.test');
    await page.getByLabel('Password').fill('wrong-pass');
    await page.getByRole('button', { name: 'Sign in' }).click();
    ok('login: wrong password shows generic error', await page.getByText('Invalid email or password.').isVisible().catch(()=>false) || (await page.getByText('Invalid email or password.').waitFor({timeout:5000}).then(()=>true).catch(()=>false)));
    await ctx.close();
  }

  // 1. Register a new student → join club → post → comment → reply → vote → bookmark → request club
  {
    const ctx = await browser.newContext(); const page = await ctx.newPage();
    const errors = []; page.on('pageerror', e => errors.push(String(e)));
    await page.goto(`${BASE}/register`);
    await page.getByLabel('Full name').fill('Test Student');
    await page.getByLabel('University email').fill(`t${Date.now()}@campus.test`);
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await page.waitForURL(/\/clubs\?welcome=1/);
    ok('register: new student lands on clubs with welcome', await page.getByText('Welcome to Campus Connect!').isVisible());

    await page.goto(`${BASE}/clubs/game-dev-lab`);
    ok('club: non-member sees visitor notice', await page.getByText("You're browsing as a visitor").isVisible());
    await page.getByRole('button', { name: 'Join' }).first().click();
    await page.getByRole('link', { name: 'New post' }).waitFor();
    ok('club: join shows New post button', await page.getByRole('link', { name: 'New post' }).isVisible());

    await page.getByRole('link', { name: 'New post' }).click();
    await page.getByRole('button', { name: 'Publish post' }).click();
    ok('post: empty title shows validation error', await page.getByText('At least 3 characters').waitFor({timeout:5000}).then(()=>true).catch(()=>false));
    await page.getByLabel('Title').fill('Looking for a jam teammate');
    await page.getByLabel('Text').fill('I do pixel art, need a programmer for the jam.');
    await page.getByLabel('Link').fill('https://itch.io/jams');
    await page.getByLabel('Image or document').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('jam notes') });
    await page.getByRole('button', { name: 'Publish post' }).click();
    await page.waitForURL(/\/posts\//);
    ok('post: created and redirected to post page', await page.getByRole('heading', { name: 'Looking for a jam teammate' }).isVisible());
    ok('post: attachment link rendered', await page.getByText('notes.txt').isVisible());
    const href = await page.locator('a[href^="/api/attachments/"]').first().getAttribute('href');
    const res = await page.request.get(BASE + href);
    ok('attachment: downloadable by signed-in user', res.status() === 200 && (await res.text()) === 'jam notes');

    await page.getByLabel('Your comment').fill('First comment!');
    await page.getByRole('button', { name: 'Comment', exact: true }).click();
    await page.getByText('First comment!').waitFor();
    ok('comment: posted', true);
    await page.getByRole('button', { name: 'Reply' }).first().click();
    await page.getByLabel('Your reply').fill('A nested reply');
    await page.getByRole('button', { name: 'Reply', exact: true }).last().click();
    await page.getByText('A nested reply').waitFor();
    ok('reply: nested reply posted', await page.locator('ul ul').getByText('A nested reply').isVisible());

    await page.getByRole('button', { name: 'Upvote' }).click();
    await page.waitForFunction(() => document.querySelector('[aria-label="Score 1"]'));
    ok('vote: upvote sets score to 1', true);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.getByRole('button', { name: 'Saved' }).waitFor();
    await page.goto(`${BASE}/saved`);
    ok('bookmark: appears on Saved page', await page.getByText('Looking for a jam teammate').isVisible());

    await page.goto(`${BASE}/`);
    ok('home: new post appears in my-clubs feed', await page.getByText('Looking for a jam teammate').isVisible());
    ok('home: official announcements strip visible', await page.getByText('From the department').isVisible());

    await page.goto(`${BASE}/clubs/request`);
    await page.getByLabel('Club name').fill('Quantum Computing Club');
    await page.getByLabel('What is it about?').fill('Qiskit tutorials and quantum algorithms reading group.');
    await page.getByLabel('Why should it exist?').fill('Several students are taking the quantum elective and want a study space.');
    await page.getByRole('button', { name: 'Send request' }).click();
    ok('request: club request sent', await page.getByText('Request sent.').waitFor({timeout:5000}).then(()=>true).catch(()=>false));
    ok('request: shows as pending', await page.getByText('Quantum Computing Club').isVisible());

    const adminRes = await page.goto(`${BASE}/admin`);
    ok('rbac: student redirected away from /admin', page.url() === `${BASE}/`);
    await page.goto(`${BASE}/events/new`);
    ok('rbac: student redirected away from /events/new', page.url() === `${BASE}/`);
    await page.goto(`${BASE}/announcements`);
    ok('rbac: student sees no "New announcement" button', !(await page.getByRole('link', { name: 'New announcement' }).isVisible()));
    ok('no page errors (student flow)', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // 2. Admin: approve request, assign moderator, announcement with attachment, event create/edit/cancel
  {
    const { ctx, page, errors } = await login(browser, 'headgr@campus.test');
    await page.goto(`${BASE}/admin`);
    const card = page.locator('li', { hasText: 'Quantum Computing Club' }).first();
    await card.getByRole('button', { name: 'Approve & create club' }).click();
    ok('admin: approve creates club', await page.getByText('“Quantum Computing Club” approved. The club is now live.').waitFor({timeout:5000}).then(()=>true).catch(()=>false));
    const card2 = page.locator('li', { hasText: 'Robotics & IoT' }).first();
    await card2.getByPlaceholder('Optional note').fill('Please merge with an existing club for now.');
    await card2.getByRole('button', { name: 'Reject' }).click();
    ok('admin: reject request', await page.getByText('“Robotics & IoT” rejected.').waitFor({timeout:5000}).then(()=>true).catch(()=>false));

    await page.getByLabel('Club', { exact: true }).selectOption({ label: 'Game Dev Lab' });
    await page.getByLabel('Student', { exact: true }).selectOption({ label: 'Ayesha Khan (student@campus.test)' });
    await page.getByRole('button', { name: 'Assign moderator' }).click();
    ok('admin: assign moderator', await page.getByText('Ayesha Khan is now a moderator.').waitFor({timeout:5000}).then(()=>true).catch(()=>false));

    await page.goto(`${BASE}/announcements/new`);
    await page.getByLabel('Title').fill('Lab 3 closed on Friday');
    await page.getByLabel('Announcement').fill('Lab 3 will be closed for maintenance on Friday. Use Lab 2 instead.');
    await page.getByLabel('Attachment').setInputFiles({ name: 'notice.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 test') });
    await page.getByRole('button', { name: 'Publish announcement' }).click();
    await page.waitForURL(`${BASE}/announcements`);
    ok('admin: announcement published with attachment + date', await page.getByText('Lab 3 closed on Friday').isVisible() && await page.getByText('notice.pdf').isVisible());

    await page.goto(`${BASE}/events/new`);
    await page.getByLabel('Title').fill('Hackathon results ceremony');
    await page.getByLabel('Description').fill('Winners announced and certificates distributed.');
    await page.getByLabel('Date').fill('2030-01-15');
    await page.getByLabel('Time (PKT)').fill('16:30');
    await page.getByLabel('Venue').fill('Auditorium B');
    await page.getByRole('button', { name: 'Create event' }).click();
    await page.waitForURL(`${BASE}/events`);
    const ev = page.locator('article', { hasText: 'Hackathon results ceremony' });
    ok('admin: event created and listed (upcoming)', await ev.isVisible());
    ok('event: time shown in PKT as entered', await ev.getByText('4:30 pm').isVisible().catch(()=>false) || (await ev.innerText()).toLowerCase().includes('4:30'), (await ev.innerText()).replace(/\n/g,' ').slice(0,120));
    await ev.getByRole('link', { name: 'Edit' }).click();
    ok('event edit: form prefilled with same time', (await page.getByLabel('Time (PKT)').inputValue()) === '16:30');
    await page.getByLabel('Venue').fill('Auditorium C');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await page.waitForURL(`${BASE}/events`);
    ok('admin: event updated', await page.locator('article', { hasText: 'Hackathon results ceremony' }).getByText('Auditorium C').isVisible());
    await page.locator('article', { hasText: 'Hackathon results ceremony' }).getByRole('button', { name: 'Cancel event' }).click();
    await page.locator('article', { hasText: 'Hackathon results ceremony' }).getByText('Cancelled').waitFor();
    ok('admin: event cancelled (still visible, labelled)', true);
    await page.goto(`${BASE}/events?tab=past`);
    ok('events: past tab lists past events', await page.getByText('Freshers\' orientation').isVisible());
    ok('no page errors (admin flow)', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // 3. Moderator scope: Hamza moderates AI & Web, NOT Competitive Programming
  {
    const { ctx, page, errors } = await login(browser, 'moderator@campus.test');
    await page.goto(`${BASE}/clubs/ai-ml-society`);
    await page.getByText('Study group for Deep Learning midterm?').click();
    await page.waitForURL(/\/posts\//);
    ok('mod: sees Pin + Delete (moderator) on others\' post in own club', await page.getByRole('button', { name: /Pin to club/ }).isVisible() && await page.getByRole('button', { name: /Delete \(moderator\)/ }).isVisible());
    await page.getByRole('button', { name: /Pin to club/ }).click();
    await page.getByRole('button', { name: /Unpin/ }).waitFor();
    ok('mod: pin works in own club', true);
    const aiPostUrl = page.url();

    await page.goto(`${BASE}/clubs/competitive-programming`);
    await page.getByText('Weekend contest #12').click();
    await page.waitForURL(/\/posts\//);
    ok('mod: NO mod tools in a club they do not moderate', !(await page.getByRole('button', { name: /Pin to club/ }).isVisible()) && !(await page.getByRole('button', { name: /Delete/ }).isVisible()));

    // Server-side enforcement: replay the pin action for a post in a club Hamza does not moderate,
    // by submitting the pin form from his own club's page with a foreign postId.
    const cpPostId = page.url().split('/posts/')[1];
    await page.goto(aiPostUrl);
    await page.evaluate((id) => { document.querySelector('form input[name="postId"][value]').closest('form'); 
      const forms=[...document.querySelectorAll('form')].filter(f=>f.textContent.includes('Unpin'));
      forms[0].querySelector('input[name="postId"]').value = id; }, cpPostId);
    await page.getByRole('button', { name: /Unpin/ }).click();
    await page.getByText("That action couldn't be completed").waitFor({ timeout: 8000 }).catch(()=>{});
    ok('rbac (server): pin on foreign club rejected', await page.getByText("That action couldn't be completed").isVisible());
    await page.goto(`${BASE}/clubs/ai-ml-society`);
    ok('mod: no Leave button on a club they moderate', !(await page.getByRole('button', { name: 'Leave' }).isVisible()));
    await page.goto(`${BASE}/clubs/ai-ml-society/new`);
    const aiHtml = await page.content();
    const aiClubId = aiHtml.match(/name="clubId" value="([0-9a-f-]{36})"/)?.[1];
    await page.goto(`${BASE}/clubs/competitive-programming`);
    const cpClubId = (await page.content()).match(/name="clubId" value="([0-9a-f-]{36})"/)?.[1];
    if (aiClubId) {
      // Tamper: submit the CP "Leave" form with the AI club's id.
      await page.evaluate((id) => { document.querySelector('input[name="clubId"]').value = id; }, aiClubId);
    }
    await page.getByRole('button', { name: 'Leave' }).click();
    await page.getByText("That action couldn't be completed").waitFor({ timeout: 8000 }).catch(()=>{});
    ok('rbac (server): moderator leave of moderated club rejected', Boolean(aiClubId) && await page.getByText("That action couldn't be completed").isVisible());
    await page.goto(`${BASE}/clubs`);
    const cardText = await page.locator('main li', { hasText: 'AI & ML Society' }).first().innerText();
    ok('clubs: AI & ML Society card shows 3 posts (matches seed)', /3 posts/.test(cardText), cardText.replace(/\n/g,' ').slice(0,80));
    await ctx.close();
  }

  // 4. Ayesha now moderates Game Dev Lab → can delete the new student's post
  {
    const { ctx, page } = await login(browser, 'student@campus.test');
    await page.goto(`${BASE}/clubs/game-dev-lab`);
    ok('assigned moderator: badge shows on club', await page.getByText('Moderator', { exact: true }).isVisible());
    await page.getByText('Looking for a jam teammate').click();
    await page.waitForURL(/\/posts\//);
    await page.getByRole('button', { name: /Delete \(moderator\)/ }).click();
    await page.waitForURL(`${BASE}/clubs/game-dev-lab`);
    ok('assigned moderator: deleted post in moderated club', !(await page.getByText('Looking for a jam teammate').isVisible()));
    await ctx.close();
  }

  await browser.close();
  console.log(results.join('\n'));
  console.log(`\n${results.filter(r=>r.startsWith('PASS')).length}/${results.length} passed`);
})().catch(e => { console.log(results.join('\n')); console.error('CRASH', e.message); process.exit(1); });
