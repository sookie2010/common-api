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
    <div class="nav-list">
      <Row v-for="menu in menus" :key="menu.name">
        <Col :span="3" class="nav-title">{{ menu.title }}</Col>
        <Col :span="21">
        <router-link :to="submenu.path" v-for="submenu in menu.child" :key="submenu.path" class="nav-item">
          <Icon :type="submenu.icon" /> {{submenu.title}}
        </router-link>
        </Col>
      </Row>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import moment from 'moment'
import menus from '../config/menu'

@Component({})
export default class Welcome extends Vue {
  private menus = menus
  private timeText!: string
  private clock = {
    hourRotate: 0,
    minuteRotate: 0,
    secondRotate: 0
  }
  private clockTimer!: number | null

  created(): void {
    const timedUpdate = (): void => {
      this.updateClock()
      this.clockTimer = setTimeout(timedUpdate, 1000)
    }
    timedUpdate()
  }
  beforeDestroy(): void {
    if(this.clockTimer) {
      clearTimeout(this.clockTimer)
      this.clockTimer = null
    }
  }
  updateClock(): void {
    const now = moment()
    this.timeText = now.format('YYYY年M月D日 HH:mm:ss')
    this.clock.secondRotate = now.seconds() * 6
    this.clock.minuteRotate = now.minutes() * 6 + this.clock.secondRotate / 60
    this.clock.hourRotate = ((now.hours() % 12) / 12) * 360 + 90 + this.clock.minuteRotate / 12
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
.nav-list {
  .nav-title {
    font-size: 16px;
    line-height: 66px;
    text-align: right;
    padding-right: 20px;
  }
  .nav-item {
    display: inline-block;
    width: 200px;
    font-size: 16px;
    margin: 10px;
    border: 1px solid #ccc;
    padding: 10px;
  }
}
</style>