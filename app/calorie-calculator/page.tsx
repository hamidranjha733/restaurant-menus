import { pageMetadata } from "@/lib/seo";
import styles from "./calculator.module.css";

const TITLE = "Calorie Calculator — Check Your Calories Before You Order";
const DESCRIPTION =
  "Free calorie calculator: estimate how many calories you need a day with the Mifflin-St Jeor equation, then see how much a restaurant meal uses before you order.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/calorie-calculator/" });

/**
 * The calculator runs in the browser. The site strips all framework JS after the build
 * (scripts/postbuild.mjs), so this is a small plain script marked data-keep, which
 * postbuild leaves in place. Nothing typed into the form leaves the page.
 */
const SCRIPT = `(function(){
  var root = document.getElementById('cc');
  if(!root) return;
  var state = { units:'us', sex:'female' };
  function $(id){ return document.getElementById(id); }

  function wireSeg(id, key, after){
    var seg = $(id);
    seg.addEventListener('click', function(e){
      var b = e.target.closest('button'); if(!b || b.dataset.v === state[key]) return;
      seg.querySelectorAll('button').forEach(function(x){ x.setAttribute('aria-pressed','false'); });
      b.setAttribute('aria-pressed','true');
      state[key] = b.dataset.v;
      if(after) after();
      calc();
    });
  }
  wireSeg('cc-units','units', toggleUnits);
  wireSeg('cc-sex','sex');

  function toggleUnits(){
    var us = state.units === 'us';
    $('cc-ht-us').hidden = !us;
    $('cc-ht-metric').hidden = us;
    $('cc-wt-u').textContent = us ? 'lb' : 'kg';
    // Convert the current numbers so switching units keeps the same person.
    var wt = $('cc-wt'), v = parseFloat(wt.value);
    if(!isNaN(v)) wt.value = us ? Math.round(v/0.453592) : Math.round(v*0.453592*10)/10; // kg to 0.1 so lb -> kg -> lb round-trips
    if(us){
      var totalIn = Math.round(num('cc-cm')/2.54);
      $('cc-ft').value = Math.floor(totalIn/12);
      $('cc-in').value = totalIn % 12;
    } else {
      $('cc-cm').value = Math.round((num('cc-ft')*12 + num('cc-in'))*2.54);
    }
  }

  function num(id){ var v = parseFloat($(id).value); return isNaN(v) ? 0 : v; }
  function fmt(n){ return Math.round(n).toLocaleString('en-US'); }
  var goalNow = 2000;

  function calc(){
    var age = num('cc-age'), kg, cm;
    if(state.units === 'us'){
      cm = (num('cc-ft')*12 + num('cc-in')) * 2.54;
      kg = num('cc-wt') * 0.453592;
    } else {
      cm = num('cc-cm');
      kg = num('cc-wt');
    }
    if(age <= 0 || kg <= 0 || cm <= 0) return;

    // Mifflin-St Jeor resting metabolic rate
    var rmr = 10*kg + 6.25*cm - 5*age + (state.sex === 'male' ? 5 : -161);
    var maintenance = rmr * parseFloat($('cc-activity').value);
    var goal = maintenance + parseFloat($('cc-goal').value);

    // Safety floor so a deficit never drops dangerously low.
    var floor = state.sex === 'male' ? 1500 : 1200;
    if(goal < floor) goal = floor;

    $('cc-goalCal').textContent  = fmt(goal);
    $('cc-maintCal').textContent = fmt(maintenance);
    $('cc-rmrCal').textContent   = fmt(rmr);
    $('cc-protein').textContent  = fmt(0.8*kg) + ' g'; // RDA: 0.8 g per kg body weight

    $('cc-mBreak').textContent  = fmt(goal*0.25);
    $('cc-mLunch').textContent  = fmt(goal*0.35);
    $('cc-mDinner').textContent = fmt(goal*0.30);
    $('cc-mSnack').textContent  = fmt(goal*0.10);

    goalNow = goal;
    checkMeal();
  }

  function checkMeal(){
    var mv = parseFloat($('cc-meal').value);
    var out = $('cc-mealResult'), bar = $('cc-mealBar');
    if(isNaN(mv) || mv <= 0){ out.textContent = ''; bar.hidden = true; return; }
    var pct = Math.round(mv/goalNow*100);
    out.innerHTML = 'That meal is <b>' + pct + '%</b> of your ' + fmt(goalNow) + '-calorie day.';
    bar.hidden = false;
    bar.firstElementChild.style.width = Math.min(pct,100) + '%';
  }

  $('cc-meal').addEventListener('input', checkMeal);
  ['cc-age','cc-ft','cc-in','cc-cm','cc-wt','cc-activity','cc-goal'].forEach(function(id){
    $(id).addEventListener('input', calc);
    $(id).addEventListener('change', calc);
  });
  calc();
})();`;

export default function CalorieCalculatorPage() {
  return (
    <div className={styles.cc} id="cc">
      <h1 className={styles.title}>Check Your Calories Before You Order</h1>
      <p className={styles.lede}>
        Many menus on this site list calories next to the price where the chain publishes them. This free calculator turns those numbers
        into something useful: it estimates how many calories you need in a day, then shows how much of that a restaurant meal uses before
        you place the order. Nothing you type leaves your browser.
      </p>

      <div className={styles.grid}>
        <div className={styles.inputs}>
          <div className={styles.toggles}>
            <div className={styles.seg} id="cc-units" role="group" aria-label="Units">
              <button type="button" data-v="us" aria-pressed="true">
                US units
              </button>
              <button type="button" data-v="metric" aria-pressed="false">
                Metric
              </button>
            </div>
            <div className={styles.seg} id="cc-sex" role="group" aria-label="Sex">
              <button type="button" data-v="female" aria-pressed="true">
                Female
              </button>
              <button type="button" data-v="male" aria-pressed="false">
                Male
              </button>
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <label htmlFor="cc-age">Age</label>
              <div className={styles.field}>
                <input id="cc-age" type="number" inputMode="numeric" defaultValue={30} min={18} max={80} />
                <span className={styles.unit}>years</span>
              </div>
            </div>
            <div>
              <label htmlFor="cc-ft">Height</label>
              <div className={styles.ht} id="cc-ht-us">
                <div className={styles.field}>
                  <input id="cc-ft" type="number" inputMode="numeric" defaultValue={5} aria-label="Height, feet" />
                  <span className={styles.unit}>ft</span>
                </div>
                <div className={styles.field}>
                  <input id="cc-in" type="number" inputMode="numeric" defaultValue={6} aria-label="Height, inches" />
                  <span className={styles.unit}>in</span>
                </div>
              </div>
              <div className={styles.field} id="cc-ht-metric" hidden>
                <input id="cc-cm" type="number" inputMode="numeric" defaultValue={168} aria-label="Height, centimeters" />
                <span className={styles.unit}>cm</span>
              </div>
            </div>
            <div>
              <label htmlFor="cc-wt">Weight</label>
              <div className={styles.field}>
                <input id="cc-wt" type="number" inputMode="numeric" defaultValue={160} />
                <span className={styles.unit} id="cc-wt-u">
                  lb
                </span>
              </div>
            </div>
          </div>

          <div className={styles.block}>
            <label htmlFor="cc-activity">How active are you?</label>
            <select id="cc-activity" defaultValue="1.375">
              <option value="1.2">Sedentary: Little or no exercise</option>
              <option value="1.375">Light: Exercise 1 to 3 days a week</option>
              <option value="1.55">Moderate: Exercise 3 to 5 days a week</option>
              <option value="1.725">Active: Exercise 6 to 7 days a week</option>
              <option value="1.9">Very active: Hard exercise or a physical job</option>
            </select>
          </div>

          <div className={styles.block} style={{ marginBottom: 0 }}>
            <label htmlFor="cc-goal">Your goal</label>
            <select id="cc-goal" defaultValue="0">
              <option value="-500">Lose weight</option>
              <option value="-250">Lose weight slowly</option>
              <option value="0">Stay at my weight</option>
              <option value="250">Gain weight slowly</option>
              <option value="500">Gain weight</option>
            </select>
          </div>
        </div>

        <div className={styles.results} aria-live="polite">
          <div className={styles.cap}>Calories for your goal</div>
          <div className={styles.big}>
            <span id="cc-goalCal">2,011</span>
            <small>calories a day</small>
          </div>

          <div className={styles.tiles}>
            <div className={styles.tile}>
              <div className={styles.v} id="cc-maintCal">
                2,011
              </div>
              <div className={styles.k}>Maintenance</div>
            </div>
            <div className={styles.tile}>
              <div className={styles.v} id="cc-rmrCal">
                1,462
              </div>
              <div className={styles.k}>Resting burn</div>
            </div>
            <div className={styles.tile}>
              <div className={styles.v} id="cc-protein">
                58 g
              </div>
              <div className={styles.k}>Minimum protein</div>
            </div>
          </div>

          <div className={styles.meals}>
            {[
              ["Breakfast", "cc-mBreak", "503"],
              ["Lunch", "cc-mLunch", "704"],
              ["Dinner", "cc-mDinner", "603"],
              ["Snack", "cc-mSnack", "201"],
            ].map(([k, id, v]) => (
              <div className={styles.tile} key={id}>
                <div className={styles.k}>{k}</div>
                <div className={styles.v} id={id}>
                  {v}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.mealcheck}>
            <label htmlFor="cc-meal">Check a restaurant meal</label>
            <div className={styles.field}>
              <input id="cc-meal" type="number" inputMode="numeric" placeholder="e.g. 1100" />
              <span className={styles.unit}>cal</span>
            </div>
            <div className={styles.mealresult} id="cc-mealResult" />
            <div className={styles.bar} id="cc-mealBar" hidden>
              <i />
            </div>
          </div>
        </div>
      </div>

      <p className={styles.note}>
        Uses the Mifflin-St Jeor equation, the formula most dietitians use, for adults aged 18 to 80. It gives a general estimate, not
        medical advice. If you are pregnant, under 18 or managing a health condition, speak with a doctor or registered dietitian.
      </p>

      <script data-keep="" dangerouslySetInnerHTML={{ __html: SCRIPT }} />
    </div>
  );
}
