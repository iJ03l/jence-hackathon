import fs from 'fs'

async function main() {
    console.log("Creating test image...")
    fs.writeFileSync('test.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'))
    
    console.log("Loading file...")
    const buffer = fs.readFileSync('test.png')
    const blob = new Blob([buffer], { type: 'image/png' })
    const file = new File([blob], 'test.png', { type: 'image/png' })
    
    const formData = new FormData()
    formData.append('file', file)
    
    console.log("Sending POST to /api/upload...")
    const res = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        body: formData,
        // no credentials since we temporarily disabled requireAuth on server
    })
    
    const data = await res.json().catch(e => ({ parseError: e.message }))
    console.log("Status:", res.status)
    console.log("Response:", data)
}

main().catch(console.error)
