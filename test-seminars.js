// Test script to check seminars in database
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testSeminars() {
  try {
    console.log('Fetching all seminars...')
    
    const { data, error } = await supabaseAdmin
      .from('seminars')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching seminars:', error)
      return
    }
    
    console.log(`Found ${data?.length || 0} seminars`)
    
    if (data && data.length > 0) {
      console.log('\nFirst seminar:')
      console.log(JSON.stringify(data[0], null, 2))
      
      console.log('\nAll seminar statuses:')
      data.forEach((seminar, index) => {
        console.log(`${index + 1}. ${seminar.title} - Status: ${seminar.status}`)
      })
    } else {
      console.log('No seminars found in database')
    }
    
    // Check with status filter
    console.log('\n\nChecking with status filter (published, ongoing)...')
    const { data: filteredData, error: filteredError } = await supabaseAdmin
      .from('seminars')
      .select('*')
      .in('status', ['published', 'ongoing'])
    
    if (filteredError) {
      console.error('Error with filtered query:', filteredError)
    } else {
      console.log(`Found ${filteredData?.length || 0} published/ongoing seminars`)
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testSeminars()