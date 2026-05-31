<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator color="var(--kpi-primary)" />
  <NuxtPage />
</template>

<script setup lang="ts">
useHead({
  script: [
    {
      innerHTML:
        "try{var t=localStorage.getItem('rttm-kpi-theme');if(t!=='dark'&&t!=='light'){t='dark'}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}",
      tagPosition: 'head',
    },
  ],
})
</script>

<style>
/* ─── Default: DARK ─────────────────────────────────── */
:root {
  --kpi-topnav:        #050d1e;
  --kpi-bg:            #0b1120;
  --kpi-surface:       #111827;
  --kpi-surface-2:     #172033;
  --kpi-border:        #1e2d45;
  --kpi-text:          #e5edf9;
  --kpi-muted:         #8fa3bb;
  --kpi-inverse:       #050d1e;

  --kpi-primary:       #4f8ef7;
  --kpi-primary-hover: #6fa3f9;
  --kpi-accent:        #2dd4bf;
  --kpi-accent-soft:   #0d2e2b;

  --kpi-success:       #34d399;
  --kpi-success-soft:  #0a2e22;
  --kpi-warning:       #fbbf24;
  --kpi-warning-soft:  #2e1f05;
  --kpi-danger:        #f87171;
  --kpi-danger-soft:   #2e0f0f;

  --kpi-soft:          #1a2740;
  --kpi-focus:         rgba(79, 142, 247, 0.28);
  --kpi-shadow:        0 4px 24px rgba(0, 0, 0, 0.4);

  --kpi-chart-1: #4f8ef7;
  --kpi-chart-2: #2dd4bf;
  --kpi-chart-3: #fbbf24;
  --kpi-chart-4: #a78bfa;
  --kpi-chart-5: #f87171;

  --kpi-blue-5: #1a2740;
}

/* ─── Light override ─────────────────────────────────── */
[data-theme='light'] {
  --kpi-topnav:        #10213f;
  --kpi-bg:            #f0f4fa;
  --kpi-surface:       #ffffff;
  --kpi-surface-2:     #f8fafc;
  --kpi-border:        #d1dce8;
  --kpi-text:          #0f172a;
  --kpi-muted:         #4e6680;
  --kpi-inverse:       #ffffff;

  --kpi-primary:       #1d4ed8;
  --kpi-primary-hover: #1e40af;
  --kpi-accent:        #0f766e;
  --kpi-accent-soft:   #ccfbf1;

  --kpi-success:       #047857;
  --kpi-success-soft:  #d1fae5;
  --kpi-warning:       #b45309;
  --kpi-warning-soft:  #fef3c7;
  --kpi-danger:        #be123c;
  --kpi-danger-soft:   #ffe4e6;

  --kpi-soft:          #e2eaf4;
  --kpi-focus:         rgba(29, 78, 216, 0.2);
  --kpi-shadow:        0 4px 20px rgba(15, 23, 42, 0.08);

  --kpi-chart-1: #1d4ed8;
  --kpi-chart-2: #0f766e;
  --kpi-chart-3: #b45309;
  --kpi-chart-4: #7c3aed;
  --kpi-chart-5: #be123c;

  --kpi-blue-5: #dbeafe;
}

html {
  background: var(--kpi-bg);
}

body {
  margin: 0;
  background: var(--kpi-bg);
  color: var(--kpi-text);
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  transition:
    background 200ms ease,
    color 200ms ease;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

button,
a,
input,
select {
  transition:
    background 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease,
    color 150ms ease,
    transform 150ms ease;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 3px solid var(--kpi-focus);
  outline-offset: 2px;
}
</style>
