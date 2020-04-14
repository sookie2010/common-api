<template>
  <div>
    <div class="clock-circle">
      <div class="clock-face">
        <div class="clock-hour" :style="{transform: `rotate(${clock.hourRotate}deg)`}" ></div>
        <div class="clock-minute" :style="{transform: `rotate(${clock.minuteRotate}deg)`}"></div>
        <div class="clock-second" :style="{transform: `rotate(${clock.secondRotate}deg)`}"></div>
      </div>
    </div>
    <h2 class="time-text">{{timeText}}</h2>
  </div>
</template>
<script>
import moment from 'moment'

var clockTimer = null
export default {
  data() {
    return {
      timeText: null,
      clock: {
        hourRotate: 0,
        minuteRotate: 0,
        secondRotate: 0
      }
    }
  },
  created() {
    const timedUpdate = () => {
      this.updateClock()
      clockTimer = setTimeout(timedUpdate, 1000)
    }
    timedUpdate()
  },
  beforeDestroy() {
    if(clockTimer) {
      clearTimeout(clockTimer)
    }
  },
  methods: {
    updateClock() {
      const now = moment()
      this.timeText = now.format('YYYY年M月D日 HH:mm:ss')
      this.clock.secondRotate = now.seconds() * 6
      this.clock.minuteRotate = now.minutes() * 6 + this.clock.secondRotate / 60
      this.clock.hourRotate = ((now.hours() % 12) / 12) * 360 + 90 + this.clock.minuteRotate / 12
    }
  }
}
</script>
<style lang="less" scoped>
.clock-circle {
  width: 180px;
  height: 180px;
  margin: 0 auto;
  position: relative;
  border: 8px solid #000;
  border-radius: 50%;
  box-shadow: 0 1px 8px rgba(34,34,34,0.3),inset 0 1px 8px rgba(34,34,34,0.3);
}

.clock-face {
  width: 100%;
  height: 100%;
  &::after {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 12px;
    height: 12px;
    margin: -6px 0 0 -6px;
    background: #000;
    border-radius: 6px;
    content: "";
    display: block
  }
}

.clock-hour,.clock-minute,.clock-second {
  width: 0;
  height: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  background: #000;
}
.clock-hour {
  margin: -4px 0 -4px -25%;
  padding: 4px 0 4px 25%;
  transform-origin: 100% 50%;
  border-radius: 4px 0 0 4px
}

.clock-minute {
  margin: -40% -3px 0;
  padding: 40% 3px 0;
  transform-origin: 50% 100%;
  border-radius: 3px 3px 0 0
}

.clock-second {
  margin: -40% -1px 0 0;
  padding: 40% 1px 0;
  transform-origin: 50% 100%
}
.time-text {
  text-align: center;
}
</style>