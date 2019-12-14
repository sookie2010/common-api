<template>
  <div>
    <div class="carousel-container">
    <Carousel style="">
      <Carousel-item v-for="(item,index) in imageSrcs" :key="index">
        <img :src="item" class="carsouel-img" />
      </Carousel-item>
    </Carousel>
    </div>
  </div>
</template>
<script>

import Carousel from 'view-design/src/components/carousel'
import CarouselItem from 'view-design/src/components/carousel-item'

const carouselImages = [
  "photo-wall/2/pic_00078.png",
  "photo-wall/1/pic_00017.jpg",
  "photo-wall/1/pic_00021.jpg",
]
export default {
  components: { Carousel, CarouselItem },
  data() {
    return {
      imageSrcs: []
    }
  },
  created() {
    this.$http.get('/common/config/picture_cdn').then(data => {
      this.imageSrcs = carouselImages.map(item => data + item)
    })
  }
}
</script>