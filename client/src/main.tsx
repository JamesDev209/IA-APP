import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'
import { dark} from '@clerk/themes'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ClerkProvider
        appearance={{
            theme: dark,
            variables: {
                colorPrimary: '#4f39f6',
                colorTextOnPrimaryBackground: '#ffffff',
            }
        }}
        publishableKey={clerkPubKey}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ClerkProvider>
    </React.StrictMode>
)