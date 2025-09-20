#!/usr/bin/env node

// Script to add a test company to the VCs we like list

const API_KEY = "f0f59724ad258dafd3990a3b351cec20acdae92f8a739e9d188c63db35edbcdb";
const LIST_ID = "ac8237a5-d6fe-46cb-9cce-e330d9e33555";

async function addCompanyToList() {
  console.log("Adding a test company to the 'VCs we like' list...\n");

  // First, get a company to add to the list
  console.log("1. Getting a company to add:");
  let companyId = null;

  try {
    const response = await fetch(`https://api.attio.com/v2/objects/companies/records/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ limit: 1 })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data?.length > 0) {
        companyId = data.data[0].id.record_id;
        const companyName = data.data[0].values.name?.[0]?.value || 'Unknown';
        console.log(`   Found company: ${companyName} (${companyId})`);
      }
    }
  } catch (error) {
    console.log(`   Failed: ${error.message}`);
    return;
  }

  if (!companyId) {
    console.log("   No companies found to add to list");
    return;
  }

  // Try different endpoints to add the company to the list
  console.log("\n2. Attempting to add company to list:");

  const addEndpoints = [
    {
      name: "POST /lists/{id}/entries",
      method: 'POST',
      url: `https://api.attio.com/v2/lists/${LIST_ID}/entries`,
      body: {
        record_id: companyId
      }
    },
    {
      name: "PUT /lists/{id}/entries",
      method: 'PUT',
      url: `https://api.attio.com/v2/lists/${LIST_ID}/entries`,
      body: {
        entries: [{ record_id: companyId }]
      }
    },
    {
      name: "POST /lists/{id}/members",
      method: 'POST',
      url: `https://api.attio.com/v2/lists/${LIST_ID}/members`,
      body: {
        record_id: companyId
      }
    },
    {
      name: "PATCH /lists/{id}",
      method: 'PATCH',
      url: `https://api.attio.com/v2/lists/${LIST_ID}`,
      body: {
        add_records: [companyId]
      }
    }
  ];

  for (const endpoint of addEndpoints) {
    console.log(`\n   Trying: ${endpoint.name}`);
    console.log(`   ${endpoint.method} ${endpoint.url}`);
    console.log(`   Body: ${JSON.stringify(endpoint.body)}`);

    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(endpoint.body)
      });

      const responseText = await response.text();

      if (!response.ok) {
        const error = responseText ? JSON.parse(responseText) : {};
        console.log(`   ❌ Error ${response.status}: ${error.message || responseText}`);
      } else {
        console.log(`   ✅ Success!`);
        if (responseText) {
          const data = JSON.parse(responseText);
          console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
        }

        // If successful, verify the company is in the list
        console.log("\n3. Verifying company is in the list:");
        await verifyListMembership(companyId);
        break;
      }
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
  }
}

async function verifyListMembership(companyId) {
  // Try to query companies with the list filter again
  try {
    const response = await fetch(`https://api.attio.com/v2/objects/companies/records/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: {
          list_entries: {
            target_record_id: {
              $in: [LIST_ID]
            }
          }
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`   Query returned ${data.data?.length || 0} companies in the list`);

      if (data.data?.length > 0) {
        const foundCompany = data.data.find(c => c.id.record_id === companyId);
        if (foundCompany) {
          console.log(`   ✅ Successfully verified company ${companyId} is in the list!`);
        } else {
          console.log(`   ⚠️  Company ${companyId} not found in list query results`);
        }
      }
    }
  } catch (error) {
    console.log(`   Failed to verify: ${error.message}`);
  }
}

addCompanyToList();
