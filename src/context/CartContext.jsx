import { createContext, useContext, useReducer } from 'react'

const CartContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { productId, size = 'M', customSizeId } = action.payload
      const existing = state.findIndex((i) => {
        if (i.productId !== productId) return false
        if (customSizeId != null) return i.customSizeId === customSizeId
        return i.size === size && i.customSizeId == null
      })
      if (existing >= 0) {
        const next = [...state]
        next[existing].quantity += 1
        return next
      }
      const item = { productId, size: customSizeId != null ? 'Custom' : size, quantity: 1 }
      if (customSizeId != null) item.customSizeId = customSizeId
      return [...state, item]
    }
    case 'REMOVE':
      return state.filter((_, i) => i !== action.payload.index)
    case 'UPDATE_QUANTITY':
      return state.map((item, i) =>
        i === action.payload.index
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      )
    case 'UPDATE_SIZE':
      return state.map((item, i) =>
        i === action.payload.index
          ? { ...item, size: action.payload.size }
          : item
      )
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [])

  const addToCart = (productId, size = 'M', customSizeId = null) => {
    dispatch({ type: 'ADD', payload: { productId, size, customSizeId } })
  }

  const removeFromCart = (index) => {
    dispatch({ type: 'REMOVE', payload: { index } })
  }

  const updateQuantity = (index, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity } })
  }

  const updateSize = (index, size) => {
    dispatch({ type: 'UPDATE_SIZE', payload: { index, size } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR' })
  }

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, updateSize, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
