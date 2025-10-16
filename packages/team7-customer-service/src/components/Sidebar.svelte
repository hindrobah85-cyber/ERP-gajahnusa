<script lang="ts">
  import { link } from 'svelte-routing'
  
  export let open = true

  const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/tickets', icon: '🎫', label: 'Tickets' },
    { path: '/customers', icon: '👥', label: 'Customers' },
    { path: '/chat', icon: '💬', label: 'Live Chat' },
    { path: '/knowledge-base', icon: '📚', label: 'Knowledge Base' },
    { path: '/reports', icon: '📈', label: 'Reports' }
  ]

  let activeItem = '/'
  
  function setActive(path: string) {
    activeItem = path
  }
</script>

<aside class="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex-shrink-0 shadow-xl">
  <div class="p-6">
    <div class="flex items-center gap-3 mb-8">
      <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl">
        🏢
      </div>
      <div>
        <h1 class="text-xl font-bold">Gajah Nusa</h1>
        <p class="text-sm text-blue-200">Customer Service</p>
      </div>
    </div>

    <nav class="space-y-2">
      {#each menuItems as item}
        <a
          href={item.path}
          use:link
          on:click={() => setActive(item.path)}
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-blue-700 {activeItem === item.path ? 'bg-blue-700 font-semibold' : ''}"
        >
          <span class="text-2xl">{item.icon}</span>
          <span>{item.label}</span>
        </a>
      {/each}
    </nav>
  </div>

  <div class="absolute bottom-0 left-0 right-0 p-6 border-t border-blue-700">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
        CS
      </div>
      <div class="flex-1">
        <div class="font-semibold">CS Agent</div>
        <div class="text-sm text-blue-200">agent@gajahnusa.com</div>
      </div>
    </div>
  </div>
</aside>
