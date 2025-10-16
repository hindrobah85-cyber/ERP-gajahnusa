<script lang="ts">
</script>

<div class="p-6">
  <h1 class="text-3xl font-bold mb-6">📈 Reports & Analytics</h1>
  
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h3 class="font-bold mb-2">Avg Response Time</h3>
      <div class="text-3xl font-bold text-blue-600">12 min</div>
    </div>
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h3 class="font-bold mb-2">Resolution Rate</h3>
      <div class="text-3xl font-bold text-green-600">94%</div>
    </div>
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h3 class="font-bold mb-2">Customer Satisfaction</h3>
      <div class="text-3xl font-bold text-purple-600">4.8/5.0</div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6">
    <h2 class="text-xl font-bold mb-4">Ticket Trends (Last 7 Days)</h2>
    <div class="h-64 flex items-end justify-around gap-4">
      {#each [45, 52, 38, 61, 48, 55, 42] as height, i}
        <div class="flex-1 bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600" style="height: {height}%"></div>
      {/each}
    </div>
    <div class="flex justify-around mt-2 text-sm text-gray-600">
      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
    </div>
  </div>
</div>
