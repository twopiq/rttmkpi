<template>
  <NuxtRouteAnnouncer />
  <NuxtPage />
</template>

<script setup lang="ts">
useHead({
  script: [
    {
      innerHTML:
        "try{var t=localStorage.getItem('rttm-kpi-theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}",
      tagPosition: 'head',
    },
  ],
})
</script>

<style>
:root {
  --kpi-blue-1: #2563EB;
  --kpi-blue-2: #172554;
  --kpi-blue-3: #1D4ED8;
  --kpi-blue-4: #0F766E;
  --kpi-blue-5: #DBEAFE;
  --kpi-bg: #F4F7FB;
  --kpi-surface: #FFFFFF;
  --kpi-surface-strong: #F8FAFC;
  --kpi-sidebar: #10213F;
  --kpi-border: #CBD5E1;
  --kpi-text: #0F172A;
  --kpi-muted: #475569;
  --kpi-inverse: #FFFFFF;
  --kpi-primary: #1D4ED8;
  --kpi-primary-hover: #1E40AF;
  --kpi-accent: #0F766E;
  --kpi-accent-soft: #CCFBF1;
  --kpi-success: #047857;
  --kpi-success-soft: #D1FAE5;
  --kpi-warning: #B45309;
  --kpi-warning-soft: #FEF3C7;
  --kpi-danger: #BE123C;
  --kpi-danger-soft: #FFE4E6;
  --kpi-soft: #E2E8F0;
  --kpi-focus: rgba(29, 78, 216, 0.22);
  --kpi-shadow: 0 14px 34px rgba(15, 23, 42, 0.09);
  --kpi-chart-1: #1D4ED8;
  --kpi-chart-2: #0F766E;
  --kpi-chart-3: #B45309;
  --kpi-chart-4: #7C3AED;
  --kpi-chart-5: #BE123C;
}

:root[data-theme='dark'] {
  --kpi-blue-1: #60A5FA;
  --kpi-blue-2: #E5EDF9;
  --kpi-blue-3: #93C5FD;
  --kpi-blue-4: #5EEAD4;
  --kpi-blue-5: #1E3A5F;
  --kpi-bg: #0B1120;
  --kpi-surface: #111827;
  --kpi-surface-strong: #172033;
  --kpi-sidebar: #07111F;
  --kpi-border: #334155;
  --kpi-text: #E5EDF9;
  --kpi-muted: #B6C3D1;
  --kpi-inverse: #07111F;
  --kpi-primary: #60A5FA;
  --kpi-primary-hover: #93C5FD;
  --kpi-accent: #5EEAD4;
  --kpi-accent-soft: #143C3A;
  --kpi-success: #34D399;
  --kpi-success-soft: #123A2C;
  --kpi-warning: #FBBF24;
  --kpi-warning-soft: #3F2B0B;
  --kpi-danger: #FB7185;
  --kpi-danger-soft: #431923;
  --kpi-soft: #1E293B;
  --kpi-focus: rgba(96, 165, 250, 0.28);
  --kpi-shadow: 0 18px 42px rgba(0, 0, 0, 0.32);
  --kpi-chart-1: #60A5FA;
  --kpi-chart-2: #5EEAD4;
  --kpi-chart-3: #FBBF24;
  --kpi-chart-4: #C4B5FD;
  --kpi-chart-5: #FB7185;
}

html {
  background: var(--kpi-bg);
}

body {
  transition:
    background 180ms ease,
    color 180ms ease;
}

button,
a,
input,
select {
  transition:
    background 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 3px solid var(--kpi-focus);
  outline-offset: 2px;
}
</style>
