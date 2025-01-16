export const card_template = {curse: `
    <div class="card curse" onclick="cardClicked(this)">
        <div class="title"></div>
        <div class="curse_content"></div>
        <div class="casting_cost"></div>
    </div>`,
time_bonus: `
<div class="card time_bonus" onclick="cardClicked(this)">
    <div class="title">Time Bonus</div>
    <div class="time_bonus_content"></div>
    <div class="time_bonus_static">minutes</div>
</div>
`,
powerup: `
<div class="card powerup" onclick="cardClicked(this)">
    <div class="title">Power Up</div>
    <div class="powerup_content"></div>
</div>`}