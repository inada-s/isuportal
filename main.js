const dotenv = require('dotenv');
const puppeteer = require('puppeteer');

function main() {
  // load .env file into process.env
  dotenv.config();

  var debug = process.env.DEBUG;
  var team_id = process.env.ISUCON_TEAM_ID;
  var password = process.env.ISUCON_PASSWORD;
  var report_path = process.env.REPORT_PATH;

  if (report_path === null) {
     report_path = '.';
  }

  console.log(team_id);

  puppeteer.launch({
    headless: !debug,
    slowMo: 1,
  }).then(async browser => {
    const page = await browser.newPage();
    await login(page, team_id, password);
    // await page.screenshot({path: path.join(report_path, 'screenshot.png')});
    try {
    } catch (e) {
      console.log(e);
      await page.screenshot({path: path.join(report_path, 'screenshot.png')});
    } finally {
      if (!debug) {
        await browser.close();
      }
    }
  });
}

async function login(page, user_id, password) {
  await Promise.all([
    page.goto('https://www.obentonet.jp/login.html'),
    page.waitForNavigation({ waitUntil: 'domcontentloaded' })
  ]);
  await page.type('#login > div > form > input[type="text"]:nth-child(8)', user_id);
  await page.type('#login > div > form > div.password > input[type="password"]', password);
  await Promise.all([
    page.click('#login > div > form > div.buttonarea > input'),
    page.waitForNavigation({ waitUntil: 'domcontentloaded' })
  ]);
}

async function visit(page) {
  await Promise.all([
    page.click('#order_area > ul > li:nth-child(3) > a'),
    page.waitForNavigation({ waitUntil: 'domcontentloaded' })
  ]);
  const boxes = (await page.$$('#list > div.all_menu > div.box'));
  var orderable_boxes = []
  for (var i = 0; i < boxes.length; i++) {
    var ordable = (await boxes[i].$('p.deadline_msg')) === null;
    var hasname = (await (await boxes[i].getProperty('innerText')).jsonValue()).search('メニューが登録されていません') == -1;
    if (ordable && hasname) {
      orderable_boxes.push(boxes[i]);
    }
  }
  await Promise.all([
    (await orderable_boxes[0].$('a.order > img')).click(),
    page.waitForNavigation({ waitUntil: 'domcontentloaded' })
  ]);
  await page.screenshot({path: 'screenshot.png'});
  await Promise.all([
    page.click('#sideInner > div > div.cartButtonArea > input[type="image"]'),
    page.waitForNavigation({ waitUntil: 'domcontentloaded' })
  ]);
  await page.screenshot({path: 'order.png'});
  await Promise.all([
    page.click('#confirm-modal'),
    page.waitForNavigation({ waitUntil: 'domcontentloaded' })
  ]);
  await page.screenshot({path: 'ordered.png'});
}

main();

