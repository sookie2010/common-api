<template>
  <div>
    <div class="carousel-container">
    <Carousel style="">
        <Carousel-item v-for="(item,index) in images">
          <img :src="item" class="carsouel-img" />
        </Carousel-item>
    </Carousel>
    </div>
  </div>
</template>
<script>

import Carousel from 'iview/src/components/carousel'
import CarouselItem from 'iview/src/components/carousel-item'

export default {
  components: { Carousel, CarouselItem },
  data() {
    return {
      images: [
        "https://cdn.colorfulsweet.site/photo-wall/2/pic_00078.png",
        "https://cdn.colorfulsweet.site/photo-wall/1/pic_00017.jpg",
        "https://cdn.colorfulsweet.site/photo-wall/1/pic_00021.jpg",
      ]
    }
  }
}
</script>