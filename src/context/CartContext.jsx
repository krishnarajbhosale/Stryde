import { createContext, useContext, useReducer } from 'react'

const CartContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { productId, size = 'M' } = action.payload
      const existing = state.findIndex(
        (i) => i.productId === productId && i.size === size
      )
      if (existing >= 0) {
        const next = [...state]
        next[existing].quantity += 1
        return next
      }
      return [...state, { productId, size, quantity: 1 }]
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
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [])

  const addToCart = (productId, size = 'M') => {
    dispatch({ type: 'ADD', payload: { productId, size } })
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

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, updateSize }}
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
