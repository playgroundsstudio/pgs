type FooterProps = {
  socialProfiles: Array<{title: string; url: string}>
  phone: string
  email: string
}

export default function Footer({socialProfiles, phone, email}: FooterProps) {
  return (
    <footer className='w-full pt-sa mt-sa pb-2 grid grid-cols-12 gap-gutter text-dark-2'>
      {socialProfiles.length > 0 && (
        <div className='col-span-5 col-start-1 flex items-baseline gap-2'>
          {socialProfiles.map((profile, i) => (
            <span key={profile.url}>
              <a href={profile.url} target='_blank' rel='noopener noreferrer' className='hover:text-dark-1 transition-colors'>{profile.title}</a>
              {i < socialProfiles.length - 1 && ','}
            </span>
          ))}
        </div>
      )}
      {(phone || email) && (
        <div className='col-span-6 col-start-7 flex items-baseline gap-2'>
          {phone && <span className='hover:text-dark-1 transition-colors cursor-pointer' onClick={() => navigator.clipboard.writeText(phone)}>{phone}</span>}
          {phone && email && ','}
          {email && <span className='hover:text-dark-1 transition-colors cursor-pointer' onClick={() => navigator.clipboard.writeText(email)}>{email}</span>}
        </div>
      )}
    </footer>
  )
}
