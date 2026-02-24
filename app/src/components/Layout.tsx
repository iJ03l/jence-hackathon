import { Outlet } from 'react-router-dom'
import Navigation from '../sections/Navigation'
import CTAFooter from '../sections/CTAFooter'
import MobileTabBar from './MobileTabBar'

export default function Layout() {
    return (
        <div className="relative min-h-screen bg-background">
            <Navigation />
            <main className="relative pb-24 md:pb-0">
                <Outlet />
            </main>
            <div className="hidden md:block">
                <CTAFooter />
            </div>
            <MobileTabBar />
        </div>
    )
}
