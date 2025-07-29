export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('jobs').del()

  // Inserts seed entries
  return knex('jobs').insert([
    {
      title: 'Frontend Developer',
      department: 'Engineering',
      openings: 2,
      status: 'Active',
      deadline: '2024-12-31',
      description: 'We are looking for a skilled Frontend Developer to join our team.',
      requirements: 'React, JavaScript, HTML, CSS, 3+ years experience',
      salary_range: '$60,000 - $80,000',
      location: 'New York, NY',
      job_type: 'Full-time'
    },
    {
      title: 'Backend Developer',
      department: 'Engineering',
      openings: 1,
      status: 'Active',
      deadline: '2024-12-31',
      description: 'Join our backend team to build scalable APIs and services.',
      requirements: 'Node.js, Express, SQL, 2+ years experience',
      salary_range: '$70,000 - $90,000',
      location: 'Remote',
      job_type: 'Full-time'
    },
    {
      title: 'UI/UX Designer',
      department: 'Design',
      openings: 1,
      status: 'Active',
      deadline: '2024-12-31',
      description: 'Create beautiful and intuitive user interfaces.',
      requirements: 'Figma, Adobe Creative Suite, 2+ years experience',
      salary_range: '$50,000 - $70,000',
      location: 'San Francisco, CA',
      job_type: 'Full-time'
    }
  ]);
} 