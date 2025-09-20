// Run this in your browser console to see available Attio objects
async function showAttioObjects() {
    try {
        // Get your token from the environment or connection
        const attioConnection = localStorage.getItem('attio_connection');
        if (!attioConnection) {
            console.log('❌ No Attio connection found. Please connect first.');
            return;
        }

        const connection = JSON.parse(attioConnection);
        console.log('🔍 Using token:', connection.token.substring(0, 10) + '...');

        // Fetch objects
        const response = await fetch('https://api.attio.com/v2/objects', {
            headers: {
                'Authorization': `Bearer ${connection.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.log('❌ API Error:', response.status, response.statusText);
            return;
        }

        const data = await response.json();
        console.log('🎯 Raw API Response:', data);

        if (data.data && data.data.length > 0) {
            console.log('\n📋 Available Objects:');
            data.data.forEach((obj, index) => {
                console.log(`${index + 1}. ID: "${obj.id}"`);
                console.log(`   Name: ${obj.singular_noun || obj.name || 'Unknown'}`);
                console.log(`   Type: ${obj.type || 'Unknown'}`);
                console.log('   ---');
            });

            console.log('\n✅ To use one of these objects, copy the exact ID from above');
            console.log('   For example, if you see ID: "person", use exactly "person" (not "people")');
        } else {
            console.log('❌ No objects found in your Attio workspace');
        }

    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

// Auto-run the function
console.log('🚀 Checking available Attio objects...');
showAttioObjects();
