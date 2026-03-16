import 'dotenv/config'
import { db } from './db/index.js'
import { vertical } from './db/schema.js'

const verticals = [
    {
        slug: 'embedded-firmware',
        name: 'Embedded & Firmware',
        description: 'RTOS design, bare-metal bring-up, interfaces, and performance tuning',
        disclaimer: 'Content is for educational purposes and engineering discussion only. Do not deploy code to safety-critical systems without proper validation.',
        iconName: 'Cpu',
        color: '#2563EB',
    },
    {
        slug: 'robotics-software',
        name: 'Robotics Software',
        description: 'ROS2, autonomy stacks, tooling, simulation, and systems integration',
        disclaimer: 'Robotics software is complex and context-specific. Validate in simulation and controlled environments before field use.',
        iconName: 'Bot',
        color: '#16A34A',
    },
    {
        slug: 'hardware-security',
        name: 'Hardware Security & Product Security',
        description: 'Defensive research, secure design, and responsible disclosure',
        disclaimer: 'All security content must follow responsible disclosure. No exploit release details for unpatched vulnerabilities.',
        iconName: 'Shield',
        color: '#F59E0B',
    },
    {
        slug: 'industrial-ot-robotics',
        name: 'Industrial / OT Robotics',
        description: 'Automation, safety systems, compliance, and deployment lessons',
        disclaimer: 'No bypassing of safety interlocks or operational controls. Follow applicable standards and regulations.',
        iconName: 'Settings',
        color: '#0EA5E9',
    },
    {
        slug: 'drones-mobile-systems',
        name: 'Drones & Mobile Systems',
        description: 'Navigation, planning, flight stacks, and field operations',
        disclaimer: 'No weaponization or export-controlled content. Follow local aviation and safety regulations.',
        iconName: 'Plane',
        color: '#6366F1',
    },
    {
        slug: 'humanoids-actuation',
        name: 'Humanoids & Actuation',
        description: 'Actuators, control loops, safety constraints, and testing',
        disclaimer: 'Respect safety limits and test procedures. Do not publish instructions that enable harm.',
        iconName: 'Activity',
        color: '#EF4444',
    },
    {
        slug: 'sensors-perception',
        name: 'Sensors & Perception',
        description: 'Cameras, lidar, radar, calibration, and perception stacks',
        disclaimer: 'Data and benchmarks must be disclosed with methodology. Avoid unsafe deployment claims.',
        iconName: 'Eye',
        color: '#22C55E',
    },
    {
        slug: 'power-thermal',
        name: 'Power / Batteries / Thermal',
        description: 'Battery management, power delivery, and thermal design',
        disclaimer: 'High-voltage and battery systems can be dangerous. Follow safety protocols and vendor guidance.',
        iconName: 'BatteryCharging',
        color: '#F97316',
    },
    {
        slug: 'mechanical-manufacturing',
        name: 'Mechanical / Manufacturing / DFM',
        description: 'DFM, materials, tolerances, and production lessons',
        disclaimer: 'Manufacturing guidance is context-specific. Validate before production use.',
        iconName: 'Wrench',
        color: '#14B8A6',
    },
    {
        slug: 'research-benchmarks',
        name: 'Research & Benchmarks',
        description: 'Reproducible experiments, datasets, and measurement methodology',
        disclaimer: 'Benchmarks must include methodology and limitations. Reproduce before drawing conclusions.',
        iconName: 'FlaskConical',
        color: '#A855F7',
    },
]

async function seed() {
    console.log('🌱 Seeding verticals...')

    for (const v of verticals) {
        await db.insert(vertical).values(v).onConflictDoNothing()
    }

    console.log(`✅ Seeded ${verticals.length} verticals`)
    process.exit(0)
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
})
