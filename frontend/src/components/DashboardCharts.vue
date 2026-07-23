<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
    <!-- Line Chart: Attendance Overview -->
    <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-bold text-slate-800">Attendance Overview</h2>
          <p class="text-xs text-slate-400">Daily check-in analytics</p>
        </div>
        <!-- Chart Legends -->
        <div class="flex items-center space-x-4 text-xs font-semibold">
          <div class="flex items-center">
            <span class="w-3 h-3 rounded-full bg-emerald-500 mr-1.5"></span>
            <span class="text-slate-600">Present</span>
          </div>
          <div class="flex items-center">
            <span class="w-3 h-3 rounded-full bg-red-500 mr-1.5"></span>
            <span class="text-slate-600">Absent</span>
          </div>
          <div class="flex items-center">
            <span class="w-3 h-3 rounded-full bg-purple-500 mr-1.5"></span>
            <span class="text-slate-600">Late</span>
          </div>
          <div class="flex items-center">
            <span class="w-3 h-3 rounded-full bg-blue-500 mr-1.5"></span>
            <span class="text-slate-600">On Leave</span>
          </div>
        </div>
      </div>

      <!-- Native SVG Line Chart -->
      <div class="relative w-full h-[250px] mt-2 select-none" ref="chartContainer">
        <svg 
          v-if="chartData && chartData.length > 0"
          class="w-full h-full" 
          viewBox="0 0 800 240" 
          preserveAspectRatio="none"
        >
          <!-- Grid Lines -->
          <line x1="40" y1="20" x2="780" y2="20" stroke="#f1f5f9" stroke-width="1" />
          <line x1="40" y1="70" x2="780" y2="70" stroke="#f1f5f9" stroke-width="1" />
          <line x1="40" y1="120" x2="780" y2="120" stroke="#f1f5f9" stroke-width="1" />
          <line x1="40" y1="170" x2="780" y2="170" stroke="#f1f5f9" stroke-width="1" />
          <line x1="40" y1="210" x2="780" y2="210" stroke="#cbd5e1" stroke-width="1" />

          <!-- Y Axis Labels -->
          <text x="15" y="24" fill="#94a3b8" font-size="10" font-weight="600" text-anchor="middle">250</text>
          <text x="15" y="74" fill="#94a3b8" font-size="10" font-weight="600" text-anchor="middle">200</text>
          <text x="15" y="124" fill="#94a3b8" font-size="10" font-weight="600" text-anchor="middle">150</text>
          <text x="15" y="174" fill="#94a3b8" font-size="10" font-weight="600" text-anchor="middle">50</text>
          <text x="15" y="214" fill="#94a3b8" font-size="10" font-weight="600" text-anchor="middle">0</text>

          <!-- SVG Lines Path -->
          <!-- Present Line -->
          <path 
            :d="presentPath" 
            fill="none" 
            stroke="#10b981" 
            stroke-width="2.5" 
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Absent Line -->
          <path 
            :d="absentPath" 
            fill="none" 
            stroke="#ef4444" 
            stroke-width="2.5" 
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Late Line -->
          <path 
            :d="latePath" 
            fill="none" 
            stroke="#a855f7" 
            stroke-width="2.5" 
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Leave Line -->
          <path 
            :d="leavePath" 
            fill="none" 
            stroke="#3b82f6" 
            stroke-width="2.5" 
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Interactive Hover Zones for Tooltips -->
          <g v-for="(point, idx) in points" :key="idx">
            <!-- Node circles on hover -->
            <circle 
              :cx="point.x" 
              :cy="point.presentY" 
              r="4" 
              fill="#10b981" 
              stroke="#ffffff"
              stroke-width="1.5"
              class="transition-all duration-150"
            />
            <circle 
              :cx="point.x" 
              :cy="point.absentY" 
              r="4" 
              fill="#ef4444" 
              stroke="#ffffff"
              stroke-width="1.5"
            />
            <circle 
              :cx="point.x" 
              :cy="point.lateY" 
              r="4" 
              fill="#a855f7" 
              stroke="#ffffff"
              stroke-width="1.5"
            />
            <circle 
              :cx="point.x" 
              :cy="point.leaveY" 
              r="4" 
              fill="#3b82f6" 
              stroke="#ffffff"
              stroke-width="1.5"
            />
            
            <!-- Hover detection column -->
            <rect
              :x="point.x - 15"
              y="10"
              width="30"
              height="200"
              fill="transparent"
              class="cursor-pointer hover:fill-blue-500/5 transition-colors"
              @mouseenter="hoveredIndex = idx"
              @mouseleave="hoveredIndex = null"
            />
          </g>
        </svg>

        <!-- X Axis labels at selected intervals to prevent crowding -->
        <div class="absolute bottom-0 left-[40px] right-[20px] flex justify-between text-[10px] font-bold text-slate-400">
          <span v-for="label in xLabels" :key="label">{{ label }}</span>
        </div>

        <!-- Tooltip box -->
        <div 
          v-if="hoveredIndex !== null && chartData[hoveredIndex]"
          class="absolute bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl z-10 pointer-events-none border border-slate-700/50"
          :style="tooltipStyle"
        >
          <p class="font-bold text-slate-300 border-b border-slate-700 pb-1 mb-1.5">{{ chartData[hoveredIndex].label }}</p>
          <div class="space-y-1 font-semibold">
            <p class="flex justify-between space-x-6"><span class="text-emerald-400">Present:</span> <span>{{ chartData[hoveredIndex].present }}</span></p>
            <p class="flex justify-between space-x-6"><span class="text-purple-400">Late:</span> <span>{{ chartData[hoveredIndex].late }}</span></p>
            <p class="flex justify-between space-x-6"><span class="text-red-400">Absent:</span> <span>{{ chartData[hoveredIndex].absent }}</span></p>
            <p class="flex justify-between space-x-6"><span class="text-blue-400">On Leave:</span> <span>{{ chartData[hoveredIndex].onLeave }}</span></p>
          </div>
        </div>
      </div>
    </div>

    <!-- Donut Chart: Attendance Summary -->
    <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
      <div>
        <h2 class="text-lg font-bold text-slate-800">Attendance Summary</h2>
        <p class="text-xs text-slate-400">Percentage distribution</p>
      </div>

      <!-- Donut Circle Visualizer -->
      <div class="flex items-center justify-center my-6 relative select-none">
        <svg class="w-40 h-40 transform -rotate-90">
          <!-- Backdrop Circle -->
          <circle 
            cx="80" 
            cy="80" 
            r="70" 
            fill="transparent" 
            stroke="#f1f5f9" 
            stroke-width="16" 
          />
          <!-- Donut Slices -->
          <circle
            v-for="slice in donutSlices"
            :key="slice.name"
            cx="80"
            cy="80"
            r="70"
            fill="transparent"
            :stroke="slice.color"
            stroke-width="16"
            :stroke-dasharray="slice.dashArray"
            :stroke-dashoffset="slice.dashOffset"
            stroke-linecap="round"
            class="transition-all duration-300 hover:stroke-[18px] cursor-pointer"
          />
        </svg>
        
        <!-- Center Labels -->
        <div class="absolute flex flex-col items-center justify-center">
          <span class="text-2xl font-black text-slate-800 leading-none">{{ summary?.counts?.total || 0 }}</span>
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Total Logs</span>
        </div>
      </div>

      <!-- Donut Legends & Breakdowns -->
      <div class="space-y-2 mt-2">
        <div 
          v-for="slice in donutSlices" 
          :key="slice.name" 
          class="flex items-center justify-between text-xs font-semibold p-1.5 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <div class="flex items-center">
            <span class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: slice.color }"></span>
            <span class="text-slate-700">{{ slice.name }}</span>
          </div>
          <div class="flex items-center space-x-2 text-right">
            <span class="text-slate-400 font-medium">({{ slice.count }})</span>
            <span class="text-slate-900 font-bold w-12">{{ slice.percentage }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
  chartData: {
    type: Array as () => any[],
    default: () => []
  },
  summary: {
    type: Object as () => any,
    default: () => null
  }
});

const chartContainer = ref<HTMLElement | null>(null);
const hoveredIndex = ref<number | null>(null);

// Generate chart coordinates
const maxEmployees = 256;
const width = 800;
const height = 240;
const paddingX = 40;
const paddingY = 25;
const drawWidth = width - paddingX - 20;
const drawHeight = height - paddingY - 20;

// Transform a data value to Y coordinate
const getY = (val: number) => {
  const v = Math.min(val, maxEmployees);
  return height - paddingY - (v / maxEmployees) * drawHeight;
};

// Transform index to X coordinate
const getX = (index: number, total: number) => {
  if (total <= 1) return paddingX;
  return paddingX + (index / (total - 1)) * drawWidth;
};

// Computed properties for SVG Line Paths
const points = computed(() => {
  const data = props.chartData;
  if (!data || data.length === 0) return [];
  
  return data.map((item, idx) => {
    return {
      x: getX(idx, data.length),
      presentY: getY(item.present),
      absentY: getY(item.absent),
      lateY: getY(item.late),
      leaveY: getY(item.onLeave)
    };
  });
});

const presentPath = computed(() => {
  return points.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.presentY}`).join(' ');
});

const absentPath = computed(() => {
  return points.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.absentY}`).join(' ');
});

const latePath = computed(() => {
  return points.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.lateY}`).join(' ');
});

const leavePath = computed(() => {
  return points.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.leaveY}`).join(' ');
});

// Calculate tooltip offsets
const tooltipStyle = computed(() => {
  if (hoveredIndex.value === null || !chartContainer.value || points.value.length === 0) return {};
  const pt = points.value[hoveredIndex.value];
  
  // Convert coordinate ratios to matching absolute pixels
  const leftPct = (pt.x / width) * 100;
  const isRightHalf = leftPct > 50;

  return {
    left: isRightHalf ? 'auto' : `${leftPct}%`,
    right: isRightHalf ? `${100 - leftPct}%` : 'auto',
    top: '30px',
    transform: 'translateX(0)'
  };
});

// Reduce density of dates labels shown on x axis (max 6 labels)
const xLabels = computed(() => {
  const data = props.chartData;
  if (!data || data.length === 0) return [];
  if (data.length <= 6) return data.map(d => d.label);
  
  const step = Math.floor(data.length / 5);
  const labels = [];
  for (let i = 0; i < data.length; i += step) {
    labels.push(data[i].label);
  }
  // Ensure last label is added
  if (labels[labels.length - 1] !== data[data.length - 1].label) {
    labels.push(data[data.length - 1].label);
  }
  return labels.slice(0, 6);
});

// Donut slices computations
// Circle radius R=70, Circumference = 2 * Math.PI * 70 = 439.82
const donutSlices = computed(() => {
  const sum = props.summary;
  if (!sum || !sum.counts || sum.counts.total === 0) return [];

  const counts = sum.counts;
  const total = counts.total;

  const data = [
    { name: 'Present', val: counts.present, color: '#10b981' },
    { name: 'Absent', val: counts.absent, color: '#ef4444' },
    { name: 'Late', val: counts.late, color: '#a855f7' },
    { name: 'On Leave', val: counts.onLeave, color: '#3b82f6' }
  ];

  let accumulated = 0;
  return data.map(item => {
    const percentage = ((item.val / total) * 100);
    const strokeLength = (percentage / 100) * 439.82;
    const strokeOffset = -((accumulated / 100) * 439.82);
    accumulated += percentage;

    return {
      name: item.name,
      count: item.val,
      percentage: percentage.toFixed(1),
      color: item.color,
      dashArray: `${strokeLength} 439.82`,
      dashOffset: strokeOffset
    };
  });
});
</script>
