import { useEffect, type ReactNode } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { RequireRole } from './components/RequireRole'
import { me } from './services/adminApi'
import { useAuthStore } from './stores/authStore'
import { CustomerLayout } from './layouts/CustomerLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { HomePage } from './pages/HomePage'
import { MenuPage } from './pages/MenuPage'
import { MenuDetailPage } from './pages/MenuDetailPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderTrackingPage } from './pages/OrderTrackingPage'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { AdminProductsPage } from './pages/AdminProductsPage'
import { AdminCategoriesPage } from './pages/AdminCategoriesPage'
import { AdminOrdersPage } from './pages/AdminOrdersPage'
import { AdminInventoryPage } from './pages/AdminInventoryPage'
import { AdminRecipesPage } from './pages/AdminRecipesPage'
import { AdminExpensesPage } from './pages/AdminExpensesPage'
import { AdminPromotionsPage } from './pages/AdminPromotionsPage'
import { AdminReportsPage } from './pages/AdminReportsPage'
import { AdminTablesPage } from './pages/AdminTablesPage'
import { KitchenPage } from './pages/KitchenPage'
import { PosPage } from './pages/PosPage'
import { CashierOrdersPage } from './pages/CashierOrdersPage'
import { NotFoundPage } from './pages/NotFoundPage'

const router = createBrowserRouter([
  {
    element: <CustomerLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/menu', element: <MenuPage /> },
      { path: '/menu/:slug', element: <MenuDetailPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/order/:token', element: <OrderTrackingPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <AdminLayout />,
    children: [
      { path: '/admin/dashboard', element: <RequireRole roles={['owner']}><DashboardPage /></RequireRole> },
      { path: '/admin/products', element: <RequireRole roles={['owner']}><AdminProductsPage /></RequireRole> },
      { path: '/admin/categories', element: <RequireRole roles={['owner']}><AdminCategoriesPage /></RequireRole> },
      { path: '/admin/orders', element: <RequireRole roles={['owner', 'cashier']}><AdminOrdersPage /></RequireRole> },
      { path: '/admin/inventory', element: <RequireRole roles={['owner']}><AdminInventoryPage /></RequireRole> },
      { path: '/admin/recipes', element: <RequireRole roles={['owner']}><AdminRecipesPage /></RequireRole> },
      { path: '/admin/expenses', element: <RequireRole roles={['owner']}><AdminExpensesPage /></RequireRole> },
      { path: '/admin/promotions', element: <RequireRole roles={['owner']}><AdminPromotionsPage /></RequireRole> },
      { path: '/admin/reports', element: <RequireRole roles={['owner']}><AdminReportsPage /></RequireRole> },
      { path: '/admin/tables', element: <RequireRole roles={['owner', 'cashier']}><AdminTablesPage /></RequireRole> },
      { path: '/cashier/pos', element: <RequireRole roles={['owner', 'cashier']}><PosPage /></RequireRole> },
      { path: '/cashier/orders', element: <RequireRole roles={['owner', 'cashier']}><CashierOrdersPage /></RequireRole> },
      { path: '/kitchen', element: <RequireRole roles={['owner', 'cashier', 'kitchen_staff']}><KitchenPage /></RequireRole> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

function AuthBootstrap({ children }: { children: ReactNode }) {
  const setUser = useAuthStore(s => s.setUser)
  const setReady = useAuthStore(s => s.setReady)

  useEffect(() => {
    if (useAuthStore.getState().isReady) return
    let active = true

    void (async () => {
      try {
        const user = await me()
        if (active) setUser(user)
      } catch {
        if (active) setUser(null)
      } finally {
        if (active) setReady(true)
      }
    })()

    return () => {
      active = false
    }
  }, [setReady, setUser])

  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>
        <RouterProvider router={router} />
      </AuthBootstrap>
    </QueryClientProvider>
  )
}
