<template>
  <div class="mermaid">
    <slot></slot>
  </div>
</template>

<script>
export default {
  beforeMount() {
    import("mermaid/dist/mermaid").then(m => {
      m.initialize({
        startOnLoad: true
      });
      m.init();
    });
  }
};
</script>

<style lang="scss">
.mermaid { border: 1px solid rgba(0,0,0,.1); margin: 1em auto; padding: 1em;
  svg { display: block; margin: 0 auto; }
}
</style>