import HeroSection from '../sections/HeroSection'
import HowItWorks from '../sections/HowItWorks'
import TrendingCreators from '../sections/TrendingCreators'
import ByTheNumbers from '../sections/ByTheNumbers'
import Verticals from '../sections/Verticals'
import ForumPreview from '../sections/ForumPreview'
import FAQ from '../sections/FAQ'

export default function LandingPage() {
    return (
        <>
            <HeroSection />
            <HowItWorks />
            <TrendingCreators />
            <ByTheNumbers />
            <Verticals />
            <ForumPreview />
            <FAQ />
        </>
    )
}
