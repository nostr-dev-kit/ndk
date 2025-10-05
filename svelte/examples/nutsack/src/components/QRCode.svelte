<script lang="ts">
  import { onMount } from 'svelte';
  import QRCode from 'qrcode';

  interface Props {
    value: string;
    size?: number;
  }

  let { value, size = 300 }: Props = $props();
  let canvas: HTMLCanvasElement;

  onMount(() => {
    generateQR();
  });

  $effect(() => {
    if (value && canvas) {
      generateQR();
    }
  });

  async function generateQR() {
    if (!canvas || !value) return;

    try {
      await QRCode.toCanvas(canvas, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (err) {
      console.error('QR Code generation failed:', err);
    }
  }
</script>

<canvas bind:this={canvas}></canvas>

<style>
  canvas {
    border-radius: 12px;
    background: white;
    padding: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
</style>
