<script lang="ts">
  import { Router, Route } from 'svelte-routing'
  import Sidebar from './components/Sidebar.svelte'
  import Dashboard from './pages/Dashboard.svelte'
  import Tickets from './pages/Tickets.svelte'
  import TicketDetail from './pages/TicketDetail.svelte'
  import Customers from './pages/Customers.svelte'
  import CustomerDetail from './pages/CustomerDetail.svelte'
  import LiveChat from './pages/LiveChat.svelte'
  import KnowledgeBase from './pages/KnowledgeBase.svelte'
  import Reports from './pages/Reports.svelte'

  let sidebarOpen = true
</script>

<Router>
  <div class="flex h-screen bg-gray-100">
    <Sidebar bind:open={sidebarOpen} />
    
    <div class="flex-1 overflow-auto">
      <Route path="/" component={Dashboard} />
      <Route path="/tickets" component={Tickets} />
      <Route path="/tickets/:id" component={TicketDetail} />
      <Route path="/customers" component={Customers} />
      <Route path="/customers/:id" component={CustomerDetail} />
      <Route path="/chat" component={LiveChat} />
      <Route path="/knowledge-base" component={KnowledgeBase} />
      <Route path="/reports" component={Reports} />
    </div>
  </div>
</Router>
