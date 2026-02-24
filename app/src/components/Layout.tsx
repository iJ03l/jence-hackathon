import { Outlet } from 'react-router-dom'
import Navigation from '../sections/Navigation'
import CTAFooter from '../sections/CTAFooter'

export default function Layout() {
    return (
        <div className="relative min-h-screen bg-background">
            <Navigation />
            <main className="relative">
                <Outlet />
            </main>
            <CTAFooter />
        </div>
    )
}
