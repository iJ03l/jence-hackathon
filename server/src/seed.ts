import 'dotenv/config'
import { db } from './db/index.js'
import { vertical } from './db/schema.js'
import { sql } from 'drizzle-orm'

const verticals = [
    {
        slug: 'embedded-firmware',
        name: 'Embedded & Firmware',
        description: 'Boot, RTOS, bring-up, instrumentation, and low-level reliability work.',
        disclaimer: 'Content is for educational purposes and engineering discussion only. Do not deploy code to safety-critical systems without proper validation.',
        iconName: 'Cpu',
        color: '#2563EB',
        tags: ['RTOS', 'Bring-up', 'Drivers', 'Tracing']
    },
    {
        slug: 'robotics-software',
        name: 'Robotics Software',
        description: 'ROS2, autonomy stacks, tooling, simulation, and runtime orchestration.',
        disclaimer: 'Robotics software is complex and context-specific. Validate in simulation and controlled environments before field use.',
        iconName: 'Bot',
        color: '#16A34A',
        tags: ['ROS2', 'Autonomy', 'Simulation', 'Tooling']
    },
    {
        slug: 'hardware-security',
        name: 'Hardware Security',
        description: 'Defensive research on boot chains, debug ports, and product security.',
        disclaimer: 'All security content must follow responsible disclosure. No exploit release details for unpatched vulnerabilities.',
        iconName: 'Shield',
        color: '#F59E0B',
        tags: ['Secure Boot', 'Product Security', 'Hardening', 'DFD']
    },
    {
        slug: 'industrial-ot-robotics',
        name: 'Industrial / OT Robotics',
        description: 'Industrial controls, OT safety, and deployment realities in factories.',
        disclaimer: 'No bypassing of safety interlocks or operational controls. Follow applicable standards and regulations.',
        iconName: 'Settings',
        color: '#0EA5E9',
        tags: ['OT', 'Safety', 'PLC', 'Deployment']
    },
    {
        slug: 'drones-mobile-systems',
        name: 'Drones & Mobile Systems',
        description: 'Mobile platforms, navigation stacks, and field reliability studies.',
        disclaimer: 'No weaponization or export-controlled content. Follow local aviation and safety regulations.',
        iconName: 'Plane',
        color: '#6366F1',
        tags: ['Navigation', 'Reliability', 'Edge', 'Field Tests']
    },
    {
        slug: 'humanoids-actuation',
        name: 'Humanoids & Actuation',
        description: 'Actuators, tendon design, torque density, and performance tradeoffs.',
        disclaimer: 'Respect safety limits and test procedures. Do not publish instructions that enable harm.',
        iconName: 'Activity',
        color: '#EF4444',
        tags: ['Actuation', 'Torque', 'Materials', 'Dynamics']
    },
    {
        slug: 'sensors-perception',
        name: 'Sensors & Perception',
        description: 'Sensor fusion, calibration, perception stacks, and benchmarking.',
        disclaimer: 'Data and benchmarks must be disclosed with methodology. Avoid unsafe deployment claims.',
        iconName: 'Eye',
        color: '#22C55E',
        tags: ['Perception', 'Calibration', 'Fusion', 'Datasets']
    },
    {
        slug: 'power-thermal',
        name: 'Power / Batteries / Thermal',
        description: 'Power delivery, thermal envelopes, and pack design tradeoffs.',
        disclaimer: 'High-voltage and battery systems can be dangerous. Follow safety protocols and vendor guidance.',
        iconName: 'BatteryCharging',
        color: '#F97316',
        tags: ['Thermal', 'Battery', 'Power', 'Reliability']
    },
    {
        slug: 'mechanical-manufacturing',
        name: 'Mechanical / Manufacturing / DFM',
        description: 'DFM, assembly workflows, tolerances, and field repairs.',
        disclaimer: 'Manufacturing guidance is context-specific. Validate before production use.',
        iconName: 'Wrench',
        color: '#14B8A6',
        tags: ['DFM', 'Manufacturing', 'Assembly', 'Tolerances']
    },
    {
        slug: 'research-benchmarks',
        name: 'Research & Benchmarks',
        description: 'Reproducible experiments, datasets, and transparent methodology.',
        disclaimer: 'Benchmarks must include methodology and limitations. Reproduce before drawing conclusions.',
        iconName: 'FlaskConical',
        color: '#A855F7',
        tags: ['Benchmarks', 'Reproducibility', 'Datasets', 'Methodology']
    },
]

async function seed() {
    console.log('🌱 Seeding verticals...')

    try {
        await db.execute(sql`TRUNCATE TABLE vertical CASCADE`)
        console.log('🧹 Cleared existing verticals')
    } catch (err) {
        console.log('⚠️ Could not truncate table (might be empty or missing)')
    }

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
