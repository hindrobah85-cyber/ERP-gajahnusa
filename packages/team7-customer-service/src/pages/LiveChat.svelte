<script lang="ts">
  let activeChatsList = [
    { id: 1, customer: 'Budi Santoso', message: 'Hi, I need help with my order', time: '2 min ago', unread: 2 },
    { id: 2, customer: 'PT Konstruksi', message: 'Thank you for your help!', time: '5 min ago', unread: 0 }
  ]

  let selectedChat = activeChatsList[0]
  let messages = [
    { sender: 'Customer', time: '14:30', message: 'Hi, I need help with my order' },
    { sender: 'Agent', time: '14:31', message: 'Hello! I\'d be happy to help. What\'s your order number?' },
    { sender: 'Customer', time: '14:32', message: 'It\'s ORD-12345' }
  ]
  
  let newMessage = ''
</script>

<div class="p-6 bg-gray-100 h-screen flex flex-col">
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">💬 Live Chat</h1>
    <p class="text-gray-600">Real-time customer support chat</p>
  </div>

  <div class="flex-1 grid grid-cols-4 gap-6 overflow-hidden">
    <!-- Chat List -->
    <div class="bg-white rounded-xl shadow-lg p-4 overflow-y-auto">
      <h3 class="font-bold mb-4">Active Chats ({activeChatsList.length})</h3>
      {#each activeChatsList as chat}
        <div class="p-3 mb-2 rounded-lg hover:bg-gray-50 cursor-pointer {chat.id === selectedChat.id ? 'bg-blue-50' : ''}">
          <div class="font-semibold mb-1">{chat.customer}</div>
          <div class="text-sm text-gray-600 truncate">{chat.message}</div>
          <div class="text-xs text-gray-500 mt-1">{chat.time}</div>
        </div>
      {/each}
    </div>

    <!-- Chat Window -->
    <div class="col-span-3 bg-white rounded-xl shadow-lg flex flex-col">
      <div class="p-4 border-b">
        <h3 class="font-bold">{selectedChat.customer}</h3>
      </div>
      
      <div class="flex-1 p-4 overflow-y-auto">
        {#each messages as msg}
          <div class="mb-4 flex {msg.sender === 'Agent' ? 'justify-end' : ''}">
            <div class="{msg.sender === 'Agent' ? 'bg-blue-100' : 'bg-gray-100'} rounded-lg p-3 max-w-md">
              <div class="text-xs text-gray-600 mb-1">{msg.time}</div>
              <div>{msg.message}</div>
            </div>
          </div>
        {/each}
      </div>

      <div class="p-4 border-t flex gap-2">
        <input
          type="text"
          bind:value={newMessage}
          placeholder="Type a message..."
          class="flex-1 px-4 py-2 border-2 rounded-lg focus:border-blue-500 outline-none"
        />
        <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Send
        </button>
      </div>
    </div>
  </div>
</div>
