<script lang="ts">
  let articles = [
    { id: 1, title: 'How to Place an Order', category: 'Orders', views: 1245 },
    { id: 2, title: 'Payment Methods Guide', category: 'Payment', views: 892 },
    { id: 3, title: 'Delivery & Shipping Info', category: 'Shipping', views: 1450 },
    { id: 4, title: 'Return & Refund Policy', category: 'Returns', views: 678 }
  ]
</script>

<div class="p-6">
  <h1 class="text-3xl font-bold mb-6">📚 Knowledge Base</h1>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    {#each articles as article}
      <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
        <h3 class="text-xl font-bold mb-2">{article.title}</h3>
        <div class="flex items-center gap-4 text-sm text-gray-600">
          <span class="px-3 py-1 bg-gray-100 rounded-full">{article.category}</span>
          <span>👁️ {article.views} views</span>
        </div>
      </div>
    {/each}
  </div>
</div>
