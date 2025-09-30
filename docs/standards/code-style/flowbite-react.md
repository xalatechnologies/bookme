# Flowbite React Complete Component Guide

## Installation & Setup

### Quick Start with CLI
```bash
# Create new project with Flowbite React
npx create-flowbite-react@latest -t nextjs

# Or add to existing project
npx flowbite-react@latest init
```

### Manual Installation
```bash
npm install flowbite-react
npm install -D tailwindcss postcss autoprefixer
```

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './node_modules/flowbite-react/**/*.js',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  plugins: [require('flowbite/plugin')],
  theme: {
    extend: {}
  }
};
```

## Complete Component Library

### 1. Accordion Component
```typescript
import { Accordion } from 'flowbite-react';

// Basic Accordion
<Accordion>
  <Accordion.Panel>
    <Accordion.Title>What is Flowbite?</Accordion.Title>
    <Accordion.Content>
      <p className="mb-2 text-gray-500 dark:text-gray-400">
        Flowbite is an open-source library of interactive components built on top of Tailwind CSS.
      </p>
    </Accordion.Content>
  </Accordion.Panel>
  <Accordion.Panel>
    <Accordion.Title>Is there a Figma file available?</Accordion.Title>
    <Accordion.Content>
      <p className="mb-2 text-gray-500 dark:text-gray-400">
        Yes, you can access the Figma file for all components.
      </p>
    </Accordion.Content>
  </Accordion.Panel>
</Accordion>

// Always Open Accordion
<Accordion alwaysOpen>
  <Accordion.Panel>
    <Accordion.Title>Panel 1</Accordion.Title>
    <Accordion.Content>Content 1</Accordion.Content>
  </Accordion.Panel>
  <Accordion.Panel>
    <Accordion.Title>Panel 2</Accordion.Title>
    <Accordion.Content>Content 2</Accordion.Content>
  </Accordion.Panel>
</Accordion>

// Flush Accordion (no borders)
<Accordion flush>
  <Accordion.Panel>
    <Accordion.Title>Flush Panel</Accordion.Title>
    <Accordion.Content>Flush content without borders</Accordion.Content>
  </Accordion.Panel>
</Accordion>

// Arrow Style Accordion
<Accordion arrowIcon={HiOutlineArrowDown}>
  <Accordion.Panel>
    <Accordion.Title>Custom Arrow</Accordion.Title>
    <Accordion.Content>Content with custom arrow</Accordion.Content>
  </Accordion.Panel>
</Accordion>
```

### 2. Alert Component
```typescript
import { Alert } from 'flowbite-react';
import { HiInformationCircle } from 'react-icons/hi';

// Basic Alerts
<Alert color="info">
  <span className="font-medium">Info alert!</span> Change a few things up and try submitting again.
</Alert>

<Alert color="failure">
  <span className="font-medium">Danger alert!</span> Change a few things up and try submitting again.
</Alert>

<Alert color="success">
  <span className="font-medium">Success alert!</span> Change a few things up and try submitting again.
</Alert>

<Alert color="warning">
  <span className="font-medium">Warning alert!</span> Change a few things up and try submitting again.
</Alert>

<Alert color="gray">
  <span className="font-medium">Dark alert!</span> Change a few things up and try submitting again.
</Alert>

// Alert with Icon
<Alert color="failure" icon={HiInformationCircle}>
  <span className="font-medium">Info alert!</span> Change a few things up and try submitting again.
</Alert>

// Dismissible Alert
<Alert color="success" onDismiss={() => alert('Alert dismissed!')}>
  <span className="font-medium">Success alert!</span> Change a few things up and try submitting again.
</Alert>

// Rounded Alert
<Alert color="warning" rounded>
  <span className="font-medium">Warning alert!</span> Change a few things up and try submitting again.
</Alert>

// Alert with Additional Content
<Alert color="info" additionalContent={
  <>
    <div className="mt-2 mb-4 text-sm text-cyan-800 dark:text-cyan-400">
      More info about this info alert goes here. This example text is going to run a bit longer so that you can see how spacing within an alert works with this kind of content.
    </div>
    <div className="flex">
      <button
        type="button"
        className="mr-2 inline-flex items-center rounded-lg bg-cyan-800 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-cyan-900 focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-800 dark:hover:bg-cyan-900"
      >
        <HiEye className="-ml-0.5 mr-2 h-4 w-4" />
        View more
      </button>
      <button
        type="button"
        className="rounded-lg border border-cyan-800 bg-transparent px-3 py-1.5 text-center text-xs font-medium text-cyan-800 hover:bg-cyan-900 hover:text-white focus:ring-4 focus:ring-cyan-300 dark:border-cyan-800 dark:text-cyan-800 dark:hover:text-white"
      >
        Dismiss
      </button>
    </div>
  </>
}>
  <div className="flex items-center">
    <HiInformationCircle className="h-4 w-4" />
    <span className="sr-only">Info</span>
    <div>
      <span className="font-medium">Ensure that these requirements are met:</span>
    </div>
  </div>
</Alert>
```

### 3. Avatar Component
```typescript
import { Avatar } from 'flowbite-react';

// Basic Avatar
<Avatar img="/images/people/profile-picture-5.jpg" alt="avatar of Jese" />

// Avatar with Border
<Avatar img="/images/people/profile-picture-5.jpg" alt="avatar of Jese" bordered />

// Rounded Avatar
<Avatar img="/images/people/profile-picture-5.jpg" alt="avatar of Jese" rounded />

// Avatar Sizes
<Avatar img="/images/people/profile-picture-5.jpg" alt="avatar of Jese" size="xs" />
<Avatar img="/images/people/profile-picture-5.jpg" alt="avatar of Jese" size="sm" />
<Avatar img="/images/people/profile-picture-5.jpg" alt="avatar of Jese" size="md" />
<Avatar img="/images/people/profile-picture-5.jpg" alt="avatar of Jese" size="lg" />
<Avatar img="/images/people/profile-picture-5.jpg" alt="avatar of Jese" size="xl" />

// Avatar with Status
<Avatar img="/images/people/profile-picture-5.jpg" alt="avatar of Jese" status="online" />
<Avatar img="/images/people/profile-picture-5.jpg" alt="avatar of Jese" status="busy" />
<Avatar img="/images/people/profile-picture-5.jpg" alt="avatar of Jese" status="away" />
<Avatar img="/images/people/profile-picture-5.jpg" alt="avatar of Jese" status="offline" />

// Avatar with Status Position
<Avatar 
  img="/images/people/profile-picture-5.jpg" 
  alt="avatar of Jese" 
  status="online" 
  statusPosition="top-left" 
/>

// Placeholder Avatar (no image)
<Avatar />

// Avatar with Initials
<Avatar placeholderInitials="RR" />

// Stacked Avatars
<Avatar.Group>
  <Avatar img="/images/people/profile-picture-1.jpg" alt="" rounded stacked />
  <Avatar img="/images/people/profile-picture-2.jpg" alt="" rounded stacked />
  <Avatar img="/images/people/profile-picture-3.jpg" alt="" rounded stacked />
  <Avatar img="/images/people/profile-picture-4.jpg" alt="" rounded stacked />
  <Avatar img="/images/people/profile-picture-5.jpg" alt="" rounded stacked />
</Avatar.Group>

// Stacked Avatars with Counter
<Avatar.Group>
  <Avatar img="/images/people/profile-picture-1.jpg" alt="" rounded stacked />
  <Avatar img="/images/people/profile-picture-2.jpg" alt="" rounded stacked />
  <Avatar img="/images/people/profile-picture-3.jpg" alt="" rounded stacked />
  <Avatar.Counter total={99} href="#" />
</Avatar.Group>
```

### 4. Badge Component
```typescript
import { Badge } from 'flowbite-react';
import { HiCheck } from 'react-icons/hi';

// Basic Badges
<Badge color="info">Default</Badge>
<Badge color="gray">Dark</Badge>
<Badge color="failure">Failure</Badge>
<Badge color="success">Success</Badge>
<Badge color="warning">Warning</Badge>
<Badge color="indigo">Indigo</Badge>
<Badge color="purple">Purple</Badge>
<Badge color="pink">Pink</Badge>

// Large Badges
<Badge color="info" size="sm">Default</Badge>

// Badge with Icon
<Badge color="success" icon={HiCheck}>
  Success
</Badge>

// Badge as Link
<Badge href="#" color="info">
  Badge link
</Badge>

// Badge with Icon Only
<Badge color="info" icon={HiCheck} />

// Pill Badges
<Badge color="info" size="sm">
  <span className="px-2 py-1">Badge</span>
</Badge>
```

### 5. Breadcrumb Component
```typescript
import { Breadcrumb } from 'flowbite-react';
import { HiHome } from 'react-icons/hi';

// Basic Breadcrumb
<Breadcrumb aria-label="Default breadcrumb example">
  <Breadcrumb.Item href="#" icon={HiHome}>
    Home
  </Breadcrumb.Item>
  <Breadcrumb.Item href="#">Projects</Breadcrumb.Item>
  <Breadcrumb.Item>Flowbite React</Breadcrumb.Item>
</Breadcrumb>

// Solid Background Breadcrumb
<Breadcrumb aria-label="Solid background breadcrumb example" className="bg-gray-50 py-3 px-5 dark:bg-gray-800">
  <Breadcrumb.Item href="#" icon={HiHome}>
    Home
  </Breadcrumb.Item>
  <Breadcrumb.Item href="#">Projects</Breadcrumb.Item>
  <Breadcrumb.Item>Flowbite React</Breadcrumb.Item>
</Breadcrumb>
```

### 6. Button Component
```typescript
import { Button } from 'flowbite-react';
import { HiOutlineArrowRight, HiShoppingCart } from 'react-icons/hi';

// Basic Buttons
<Button>Default</Button>
<Button color="blue">Blue</Button>
<Button color="gray">Gray</Button>
<Button color="dark">Dark</Button>
<Button color="light">Light</Button>
<Button color="success">Success</Button>
<Button color="failure">Failure</Button>
<Button color="warning">Warning</Button>
<Button color="purple">Purple</Button>

// Button Sizes
<Button size="xs">Extra small</Button>
<Button size="sm">Small</Button>
<Button size="md">Base</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra large</Button>

// Button with Icons
<Button>
  <HiShoppingCart className="mr-2 h-5 w-5" />
  Buy now
</Button>

<Button>
  Choose plan
  <HiOutlineArrowRight className="ml-2 h-5 w-5" />
</Button>

// Icon Only Button
<Button>
  <HiOutlineArrowRight className="h-5 w-5" />
</Button>

// Button States
<Button disabled>Disabled button</Button>

// Loading Button
<Button isProcessing>Loading...</Button>

<Button isProcessing processingSpinner={<AiOutlineLoading className="h-6 w-6 animate-spin" />}>
  Loading...
</Button>

// Outline Buttons
<Button outline>Default</Button>
<Button outline color="gray">Gray</Button>
<Button outline gradientDuoTone="purpleToBlue">Purple to blue</Button>

// Gradient Buttons
<Button gradientDuoTone="purpleToBlue">Purple to blue</Button>
<Button gradientDuoTone="cyanToBlue">Cyan to blue</Button>
<Button gradientDuoTone="greenToBlue">Green to blue</Button>
<Button gradientDuoTone="purpleToPink">Purple to pink</Button>
<Button gradientDuoTone="pinkToOrange">Pink to orange</Button>
<Button gradientDuoTone="tealToLime">Teal to lime</Button>
<Button gradientDuoTone="redToYellow">Red to yellow</Button>

// Monochrome Gradient
<Button gradientMonochrome="info">Info</Button>
<Button gradientMonochrome="success">Success</Button>
<Button gradientMonochrome="cyan">Cyan</Button>
<Button gradientMonochrome="teal">Teal</Button>
<Button gradientMonochrome="lime">Lime</Button>
<Button gradientMonochrome="failure">Failure</Button>
<Button gradientMonochrome="pink">Pink</Button>
<Button gradientMonochrome="purple">Purple</Button>

// Pills
<Button pill>Default</Button>
<Button pill color="blue">Blue</Button>

// Button as Link
<Button href="/dashboard">Dashboard</Button>
```

### 7. Button Group Component
```typescript
import { Button } from 'flowbite-react';

// Basic Button Group
<Button.Group>
  <Button color="gray">Profile</Button>
  <Button color="gray">Settings</Button>
  <Button color="gray">Messages</Button>
</Button.Group>

// Button Group with Icons
<Button.Group>
  <Button color="gray">
    <HiUserCircle className="mr-3 h-4 w-4" />
    Profile
  </Button>
  <Button color="gray">
    <HiAdjustments className="mr-3 h-4 w-4" />
    Settings
  </Button>
  <Button color="gray">
    <HiCloudDownload className="mr-3 h-4 w-4" />
    Messages
  </Button>
</Button.Group>

// Outline Button Group
<Button.Group outline>
  <Button color="gray">Profile</Button>
  <Button color="gray">Settings</Button>
  <Button color="gray">Messages</Button>
</Button.Group>

// Pills Button Group
<Button.Group pill>
  <Button color="gray">Profile</Button>
  <Button color="gray">Settings</Button>
  <Button color="gray">Messages</Button>
</Button.Group>
```

### 8. Card Component
```typescript
import { Card } from 'flowbite-react';

// Basic Card
<Card className="max-w-sm">
  <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
    Noteworthy technology acquisitions 2021
  </h5>
  <p className="font-normal text-gray-700 dark:text-gray-400">
    Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.
  </p>
</Card>

// Card with Image
<Card
  className="max-w-sm"
  imgAlt="Meaningful alt text for an image that is not purely decorative"
  imgSrc="/images/blog/image-1.jpg"
>
  <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
    Noteworthy technology acquisitions 2021
  </h5>
  <p className="font-normal text-gray-700 dark:text-gray-400">
    Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.
  </p>
</Card>

// Horizontal Card
<Card className="max-w-sm" horizontal>
  <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
    Noteworthy technology acquisitions 2021
  </h5>
  <p className="font-normal text-gray-700 dark:text-gray-400">
    Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.
  </p>
</Card>

// Card as Link
<Card href="#" className="max-w-sm">
  <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
    Noteworthy technology acquisitions 2021
  </h5>
  <p className="font-normal text-gray-700 dark:text-gray-400">
    Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.
  </p>
</Card>

// Card with CTA Button
<Card className="max-w-sm">
  <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
    Noteworthy technology acquisitions 2021
  </h5>
  <p className="font-normal text-gray-700 dark:text-gray-400">
    Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.
  </p>
  <Button>
    Read more
    <svg className="-mr-1 ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  </Button>
</Card>
```

### 9. Carousel Component
```typescript
import { Carousel } from 'flowbite-react';

// Basic Carousel
<div className="h-56 sm:h-64 xl:h-80 2xl:h-96">
  <Carousel>
    <img src="/images/carousel/carousel-1.svg" alt="..." />
    <img src="/images/carousel/carousel-2.svg" alt="..." />
    <img src="/images/carousel/carousel-3.svg" alt="..." />
    <img src="/images/carousel/carousel-4.svg" alt="..." />
    <img src="/images/carousel/carousel-5.svg" alt="..." />
  </Carousel>
</div>

// Carousel with Indicators
<div className="h-56 sm:h-64 xl:h-80 2xl:h-96">
  <Carousel indicators={false}>
    <img src="/images/carousel/carousel-1.svg" alt="..." />
    <img src="/images/carousel/carousel-2.svg" alt="..." />
    <img src="/images/carousel/carousel-3.svg" alt="..." />
  </Carousel>
</div>

// Carousel without Controls
<div className="h-56 sm:h-64 xl:h-80 2xl:h-96">
  <Carousel leftControl=" " rightControl=" ">
    <img src="/images/carousel/carousel-1.svg" alt="..." />
    <img src="/images/carousel/carousel-2.svg" alt="..." />
    <img src="/images/carousel/carousel-3.svg" alt="..." />
  </Carousel>
</div>

// Carousel with Custom Controls
<div className="h-56 sm:h-64 xl:h-80 2xl:h-96">
  <Carousel 
    leftControl={<span>Prev</span>}
    rightControl={<span>Next</span>}
  >
    <img src="/images/carousel/carousel-1.svg" alt="..." />
    <img src="/images/carousel/carousel-2.svg" alt="..." />
    <img src="/images/carousel/carousel-3.svg" alt="..." />
  </Carousel>
</div>

// Slideshow Carousel
<div className="h-56 sm:h-64 xl:h-80 2xl:h-96">
  <Carousel slideInterval={5000}>
    <img src="/images/carousel/carousel-1.svg" alt="..." />
    <img src="/images/carousel/carousel-2.svg" alt="..." />
    <img src="/images/carousel/carousel-3.svg" alt="..." />
  </Carousel>
</div>
```

### 10. Checkbox Component
```typescript
import { Checkbox, Label } from 'flowbite-react';

// Basic Checkbox
<div className="flex items-center gap-2">
  <Checkbox id="accept" defaultChecked />
  <Label htmlFor="accept" className="flex">
    I agree with the&nbsp;
    <Link href="#" className="text-cyan-600 hover:underline dark:text-cyan-500">
      terms and conditions
    </Link>
  </Label>
</div>

// Disabled Checkbox
<div className="flex items-center gap-2">
  <Checkbox id="disabled" disabled />
  <Label htmlFor="disabled">Disabled checkbox</Label>
</div>

// Checkbox with Helper Text
<fieldset className="flex max-w-md flex-col gap-4">
  <legend className="mb-4">Choose your favorite country</legend>
  <div className="flex items-center gap-2">
    <Checkbox id="united-state" name="countries" value="USA" defaultChecked />
    <Label htmlFor="united-state">United States</Label>
  </div>
  <div className="flex items-center gap-2">
    <Checkbox id="germany" name="countries" value="Germany" />
    <Label htmlFor="germany">Germany</Label>
  </div>
  <div className="flex items-center gap-2">
    <Checkbox id="spain" name="countries" value="Spain" />
    <Label htmlFor="spain">Spain</Label>
  </div>
  <div className="flex items-center gap-2">
    <Checkbox id="uk" name="countries" value="United Kingdom" />
    <Label htmlFor="uk">United Kingdom</Label>
  </div>
  <div className="flex items-center gap-2">
    <Checkbox id="china" name="countries" value="China" disabled />
    <Label htmlFor="china" disabled>
      China (disabled)
    </Label>
  </div>
</fieldset>
```

### 11. Datepicker Component
```typescript
import { Datepicker, Label } from 'flowbite-react';

// Basic Datepicker
<div className="max-w-sm">
  <Label htmlFor="datepicker" value="Select date" />
  <Datepicker id="datepicker" />
</div>

// Datepicker with Custom Format
<div className="max-w-sm">
  <Label htmlFor="datepicker-format" value="Select date" />
  <Datepicker id="datepicker-format" language="en" labelTodayButton="Today" labelClearButton="Clear" />
</div>

// Inline Datepicker
<Datepicker inline />

// Datepicker with Min/Max Date
<Datepicker 
  minDate={new Date(2023, 0, 1)} 
  maxDate={new Date(2024, 11, 31)} 
/>
```

### 12. Dropdown Component
```typescript
import { Dropdown, Avatar } from 'flowbite-react';

// Basic Dropdown
<Dropdown label="Dropdown button" dismissOnClick={false}>
  <Dropdown.Item>Dashboard</Dropdown.Item>
  <Dropdown.Item>Settings</Dropdown.Item>
  <Dropdown.Item>Earnings</Dropdown.Item>
  <Dropdown.Item>Sign out</Dropdown.Item>
</Dropdown>

// Dropdown with Divider
<Dropdown label="Dropdown button">
  <Dropdown.Item>Dashboard</Dropdown.Item>
  <Dropdown.Item>Settings</Dropdown.Item>
  <Dropdown.Item>Earnings</Dropdown.Item>
  <Dropdown.Divider />
  <Dropdown.Item>Sign out</Dropdown.Item>
</Dropdown>

// Dropdown with Header
<Dropdown
  label={<Avatar alt="User settings" img="/images/people/profile-picture-5.jpg" rounded />}
  arrowIcon={false}
  inline
>
  <Dropdown.Header>
    <span className="block text-sm">Bonnie Green</span>
    <span className="block truncate text-sm font-medium">bonnie@flowbite.com</span>
  </Dropdown.Header>
  <Dropdown.Item>Dashboard</Dropdown.Item>
  <Dropdown.Item>Settings</Dropdown.Item>
  <Dropdown.Item>Earnings</Dropdown.Item>
  <Dropdown.Divider />
  <Dropdown.Item>Sign out</Dropdown.Item>
</Dropdown>

// Dropdown Sizes
<Dropdown label="Small dropdown" size="sm">
  <Dropdown.Item>Dashboard</Dropdown.Item>
  <Dropdown.Item>Settings</Dropdown.Item>
</Dropdown>

<Dropdown label="Large dropdown" size="lg">
  <Dropdown.Item>Dashboard</Dropdown.Item>
  <Dropdown.Item>Settings</Dropdown.Item>
</Dropdown>

// Dropdown Placement
<Dropdown label="Dropdown top" placement="top">
  <Dropdown.Item>Dashboard</Dropdown.Item>
  <Dropdown.Item>Settings</Dropdown.Item>
</Dropdown>

<Dropdown label="Dropdown right" placement="right">
  <Dropdown.Item>Dashboard</Dropdown.Item>
  <Dropdown.Item>Settings</Dropdown.Item>
</Dropdown>

<Dropdown label="Dropdown left" placement="left">
  <Dropdown.Item>Dashboard</Dropdown.Item>
  <Dropdown.Item>Settings</Dropdown.Item>
</Dropdown>
```

### 13. Footer Component
```typescript
import { Footer } from 'flowbite-react';
import { BsDribbble, BsFacebook, BsGithub, BsInstagram, BsTwitter } from 'react-icons/bs';

// Basic Footer
<Footer container>
  <Footer.Copyright href="#" by="Flowbite™" year={2022} />
  <Footer.LinkGroup>
    <Footer.Link href="#">About</Footer.Link>
    <Footer.Link href="#">Privacy Policy</Footer.Link>
    <Footer.Link href="#">Licensing</Footer.Link>
    <Footer.Link href="#">Contact</Footer.Link>
  </Footer.LinkGroup>
</Footer>

// Footer with Logo
<Footer container>
  <div className="w-full">
    <div className="grid w-full justify-between sm:flex sm:justify-between md:flex md:grid-cols-1">
      <div>
        <Footer.Brand
          href="https://flowbite.com"
          src="/favicon.svg"
          alt="Flowbite Logo"
          name="Flowbite"
        />
      </div>
      <div className="grid grid-cols-2 gap-8 sm:mt-4 sm:grid-cols-3 sm:gap-6">
        <div>
          <Footer.Title title="about" />
          <Footer.LinkGroup col>
            <Footer.Link href="#">Flowbite</Footer.Link>
            <Footer.Link href="#">Tailwind CSS</Footer.Link>
          </Footer.LinkGroup>
        </div>
        <div>
          <Footer.Title title="Follow us" />
          <Footer.LinkGroup col>
            <Footer.Link href="#">Github</Footer.Link>
            <Footer.Link href="#">Discord</Footer.Link>
          </Footer.LinkGroup>
        </div>
        <div>
          <Footer.Title title="Legal" />
          <Footer.LinkGroup col>
            <Footer.Link href="#">Privacy Policy</Footer.Link>
            <Footer.Link href="#">Terms &amp; Conditions</Footer.Link>
          </Footer.LinkGroup>
        </div>
      </div>
    </div>
    <Footer.Divider />
    <div className="w-full sm:flex sm:items-center sm:justify-between">
      <Footer.Copyright href="#" by="Flowbite™" year={2022} />
      <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
        <Footer.Icon href="#" icon={BsFacebook} />
        <Footer.Icon href="#" icon={BsInstagram} />
        <Footer.Icon href="#" icon={BsTwitter} />
        <Footer.Icon href="#" icon={BsGithub} />
        <Footer.Icon href="#" icon={BsDribbble} />
      </div>
    </div>
  </div>
</Footer>

// Sitemap Footer
<Footer bgDark>
  <div className="w-full">
    <div className="grid w-full grid-cols-2 gap-8 py-8 px-6 md:grid-cols-4">
      <div>
        <Footer.Title title="Company" />
        <Footer.LinkGroup col>
          <Footer.Link href="#">About</Footer.Link>
          <Footer.Link href="#">Careers</Footer.Link>
          <Footer.Link href="#">Brand Center</Footer.Link>
          <Footer.Link href="#">Blog</Footer.Link>
        </Footer.LinkGroup>
      </div>
      <div>
        <Footer.Title title="help center" />
        <Footer.LinkGroup col>
          <Footer.Link href="#">Discord Server</Footer.Link>
          <Footer.Link href="#">Twitter</Footer.Link>
          <Footer.Link href="#">Facebook</Footer.Link>
          <Footer.Link href="#">Contact Us</Footer.Link>
        </Footer.LinkGroup>
      </div>
      <div>
        <Footer.Title title="legal" />
        <Footer.LinkGroup col>
          <Footer.Link href="#">Privacy Policy</Footer.Link>
          <Footer.Link href="#">Licensing</Footer.Link>
          <Footer.Link href="#">Terms &amp; Conditions</Footer.Link>
        </Footer.LinkGroup>
      </div>
      <div>
        <Footer.Title title="download" />
        <Footer.LinkGroup col>
          <Footer.Link href="#">iOS</Footer.Link>
          <Footer.Link href="#">Android</Footer.Link>
          <Footer.Link href="#">Windows</Footer.Link>
          <Footer.Link href="#">MacOS</Footer.Link>
        </Footer.LinkGroup>
      </div>
    </div>
    <div className="w-full bg-gray-700 py-4 px-4 sm:flex sm:items-center sm:justify-between">
      <Footer.Copyright href="#" by="Flowbite™" year={2022} />
      <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
        <Footer.Icon href="#" icon={BsFacebook} />
        <Footer.Icon href="#" icon={BsInstagram} />
        <Footer.Icon href="#" icon={BsTwitter} />
        <Footer.Icon href="#" icon={BsGithub} />
        <Footer.Icon href="#" icon={BsDribbble} />
      </div>
    </div>
  </div>
</Footer>
```

### 14. Forms Components
```typescript
import { Label, TextInput, Textarea, Select, FileInput, Radio, Checkbox, ToggleSwitch, RangeSlider } from 'flowbite-react';

// Text Input
<div className="mb-2 block">
  <Label htmlFor="email1" value="Your email" />
</div>
<TextInput id="email1" type="email" placeholder="name@flowbite.com" required />

// Text Input with Icon
<div className="mb-2 block">
  <Label htmlFor="email4" value="Your email" />
</div>
<TextInput id="email4" type="email" icon={HiMail} placeholder="name@flowbite.com" required />

// Text Input with Helper Text
<div className="mb-2 block">
  <Label htmlFor="email3" value="Your email" />
</div>
<TextInput id="email3" type="email" placeholder="name@flowbite.com" required helperText={
  <>
    We'll never share your details. Read our{' '}
    <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
      Privacy Policy
    </a>
    .
  </>
} />

// Text Input Sizes
<div className="flex flex-col gap-4">
  <div>
    <div className="mb-2 block">
      <Label htmlFor="small" value="Small input" />
    </div>
    <TextInput id="small" type="text" sizing="sm" />
  </div>
  <div>
    <div className="mb-2 block">
      <Label htmlFor="base" value="Base input" />
    </div>
    <TextInput id="base" type="text" sizing="md" />
  </div>
  <div>
    <div className="mb-2 block">
      <Label htmlFor="large" value="Large input" />
    </div>
    <TextInput id="large" type="text" sizing="lg" />
  </div>
</div>

// Textarea
<div className="mb-2 block">
  <Label htmlFor="comment" value="Your message" />
</div>
<Textarea id="comment" placeholder="Leave a comment..." required rows={4} />

// Select Dropdown
<div className="mb-2 block">
  <Label htmlFor="countries" value="Select your country" />
</div>
<Select id="countries" required>
  <option>United States</option>
  <option>Canada</option>
  <option>France</option>
  <option>Germany</option>
</Select>

// File Input
<div className="mb-2 block">
  <Label htmlFor="file" value="Upload file" />
</div>
<FileInput id="file" />

// File Input with Helper Text
<div className="mb-2 block">
  <Label htmlFor="file-upload-helper-text" value="Upload file" />
</div>
<FileInput
  id="file-upload-helper-text"
  helperText="A profile picture is useful to confirm your are logged into your account"
/>

// Multiple File Upload
<div className="mb-2 block">
  <Label htmlFor="multiple-file-upload" value="Upload multiple files" />
</div>
<FileInput id="multiple-file-upload" multiple />

// Radio Buttons
<fieldset className="flex max-w-md flex-col gap-4">
  <legend className="mb-4">Choose your favorite country</legend>
  <div className="flex items-center gap-2">
    <Radio id="united-state" name="countries" value="USA" defaultChecked />
    <Label htmlFor="united-state">United States</Label>
  </div>
  <div className="flex items-center gap-2">
    <Radio id="germany" name="countries" value="Germany" />
    <Label htmlFor="germany">Germany</Label>
  </div>
  <div className="flex items-center gap-2">
    <Radio id="spain" name="countries" value="Spain" />
    <Label htmlFor="spain">Spain</Label>
  </div>
  <div className="flex items-center gap-2">
    <Radio id="uk" name="countries" value="United Kingdom" />
    <Label htmlFor="uk">United Kingdom</Label>
  </div>
  <div className="flex items-center gap-2">
    <Radio id="china" name="countries" value="China" disabled />
    <Label htmlFor="china" disabled>
      China (disabled)
    </Label>
  </div>
</fieldset>

// Toggle Switch
<ToggleSwitch checked={switch1} label="Toggle me" onChange={setSwitch1} />
<ToggleSwitch checked={switch2} label="Toggle me (checked)" onChange={setSwitch2} />
<ToggleSwitch checked={false} disabled label="Toggle me (disabled)" onChange={() => {}} />

// Range Slider
<div className="mb-1 block">
  <Label htmlFor="default-range" value="Default range" />
</div>
<RangeSlider id="default-range" />

// Range Slider with Min/Max/Step
<div className="mb-1 block">
  <Label htmlFor="sm-range" value="Small range" />
</div>
<RangeSlider id="sm-range" sizing="sm" />

<div className="mb-1 block">
  <Label htmlFor="md-range" value="Medium range" />
</div>
<RangeSlider id="md-range" sizing="md" />

<div className="mb-1 block">
  <Label htmlFor="lg-range" value="Large range" />
</div>
<RangeSlider id="lg-range" sizing="lg" />

// Disabled Range
<div className="mb-1 block">
  <Label htmlFor="disabled-range" value="Disabled range" />
</div>
<RangeSlider id="disabled-range" disabled />

// Range with Min, Max, and Step
<div className="mb-1 block">
  <Label htmlFor="steps-range" value="Min-max range" />
</div>
<RangeSlider id="steps-range" min={0} max={10} defaultValue={2.5} step={0.5} />
```

### 15. List Group Component
```typescript
import { ListGroup } from 'flowbite-react';
import { HiCloudDownload, HiInbox, HiOutlineAdjustments, HiUserCircle } from 'react-icons/hi';

// Basic List Group
<ListGroup className="w-48">
  <ListGroup.Item>Profile</ListGroup.Item>
  <ListGroup.Item>Settings</ListGroup.Item>
  <ListGroup.Item>Messages</ListGroup.Item>
  <ListGroup.Item>Download</ListGroup.Item>
</ListGroup>

// List Group with Links
<ListGroup className="w-48">
  <ListGroup.Item href="#" active>
    Profile
  </ListGroup.Item>
  <ListGroup.Item href="#">Settings</ListGroup.Item>
  <ListGroup.Item href="#">Messages</ListGroup.Item>
  <ListGroup.Item href="#">Download</ListGroup.Item>
</ListGroup>

// List Group with Buttons
<ListGroup className="w-48">
  <ListGroup.Item onClick={() => alert('Profile clicked!')} active>
    Profile
  </ListGroup.Item>
  <ListGroup.Item onClick={() => alert('Settings clicked!')}>Settings</ListGroup.Item>
  <ListGroup.Item onClick={() => alert('Messages clicked!')}>Messages</ListGroup.Item>
  <ListGroup.Item onClick={() => alert('Download clicked!')}>Download</ListGroup.Item>
</ListGroup>

// List Group with Icons
<ListGroup className="w-48">
  <ListGroup.Item active icon={HiUserCircle}>
    Profile
  </ListGroup.Item>
  <ListGroup.Item icon={HiOutlineAdjustments}>Settings</ListGroup.Item>
  <ListGroup.Item icon={HiInbox}>Messages</ListGroup.Item>
  <ListGroup.Item icon={HiCloudDownload}>Download</ListGroup.Item>
</ListGroup>
```

### 16. Modal Component
```typescript
import { Modal, Button } from 'flowbite-react';
import { useState } from 'react';

// Basic Modal
const [openModal, setOpenModal] = useState(false);

<>
  <Button onClick={() => setOpenModal(true)}>Toggle modal</Button>
  <Modal show={openModal} onClose={() => setOpenModal(false)}>
    <Modal.Header>Terms of Service</Modal.Header>
    <Modal.Body>
      <div className="space-y-6">
        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
          With less than a month to go before the European Union enacts new consumer privacy laws for its citizens,
          companies around the world are updating their terms of service agreements to comply.
        </p>
        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
          The European Union's General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant
          to ensure a common set of data rights in the European Union. It requires organizations to notify users as
          soon as possible of high-risk data breaches that could personally affect them.
        </p>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={() => setOpenModal(false)}>I accept</Button>
      <Button color="gray" onClick={() => setOpenModal(false)}>
        Decline
      </Button>
    </Modal.Footer>
  </Modal>
</>

// Modal Sizes
<Modal show={openModal} size="md" onClose={() => setOpenModal(false)}>
  <Modal.Header>Small modal</Modal.Header>
  <Modal.Body>Modal content</Modal.Body>
</Modal>

<Modal show={openModal} size="xl" onClose={() => setOpenModal(false)}>
  <Modal.Header>Extra large modal</Modal.Header>
  <Modal.Body>Modal content</Modal.Body>
</Modal>

// Popup Modal
<Modal show={openModal} size="md" onClose={() => setOpenModal(false)} popup>
  <Modal.Header />
  <Modal.Body>
    <div className="text-center">
      <HiOutlineExclamationTriangle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
      <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
        Are you sure you want to delete this product?
      </h3>
      <div className="flex justify-center gap-4">
        <Button color="failure" onClick={() => setOpenModal(false)}>
          {"Yes, I'm sure"}
        </Button>
        <Button color="gray" onClick={() => setOpenModal(false)}>
          No, cancel
        </Button>
      </div>
    </div>
  </Modal.Body>
</Modal>

// Form Modal
<Modal show={openModal} onClose={() => setOpenModal(false)}>
  <Modal.Header>Create new account</Modal.Header>
  <Modal.Body>
    <form className="space-y-6">
      <div>
        <Label htmlFor="email" value="Your email" />
        <TextInput id="email" placeholder="name@company.com" required />
      </div>
      <div>
        <Label htmlFor="password" value="Your password" />
        <TextInput id="password" type="password" required />
      </div>
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Checkbox id="remember" />
          <Label htmlFor="remember">Remember me</Label>
        </div>
        <a href="#" className="text-sm text-cyan-700 hover:underline dark:text-cyan-500">
          Lost Password?
        </a>
      </div>
    </form>
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={() => setOpenModal(false)}>Create account</Button>
    <Button color="gray" onClick={() => setOpenModal(false)}>
      Cancel
    </Button>
  </Modal.Footer>
</Modal>
```

### 17. Navbar Component
```typescript
import { Navbar, Avatar, Dropdown, Button } from 'flowbite-react';

// Basic Navbar
<Navbar fluid rounded>
  <Navbar.Brand href="https://flowbite-react.com">
    <img src="/favicon.svg" className="mr-3 h-6 sm:h-9" alt="Flowbite React Logo" />
    <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Flowbite React</span>
  </Navbar.Brand>
  <Navbar.Toggle />
  <Navbar.Collapse>
    <Navbar.Link href="#" active>
      Home
    </Navbar.Link>
    <Navbar.Link href="#">About</Navbar.Link>
    <Navbar.Link href="#">Services</Navbar.Link>
    <Navbar.Link href="#">Pricing</Navbar.Link>
    <Navbar.Link href="#">Contact</Navbar.Link>
  </Navbar.Collapse>
</Navbar>

// Navbar with CTA
<Navbar fluid rounded>
  <Navbar.Brand href="https://flowbite-react.com">
    <img src="/favicon.svg" className="mr-3 h-6 sm:h-9" alt="Flowbite React Logo" />
    <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Flowbite React</span>
  </Navbar.Brand>
  <div className="flex md:order-2">
    <Button>Get started</Button>
    <Navbar.Toggle />
  </div>
  <Navbar.Collapse>
    <Navbar.Link href="#" active>
      Home
    </Navbar.Link>
    <Navbar.Link href="#">About</Navbar.Link>
    <Navbar.Link href="#">Services</Navbar.Link>
    <Navbar.Link href="#">Pricing</Navbar.Link>
    <Navbar.Link href="#">Contact</Navbar.Link>
  </Navbar.Collapse>
</Navbar>

// Navbar with Dropdown
<Navbar fluid rounded>
  <Navbar.Brand href="https://flowbite-react.com">
    <img src="/favicon.svg" className="mr-3 h-6 sm:h-9" alt="Flowbite React Logo" />
    <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Flowbite React</span>
  </Navbar.Brand>
  <div className="flex md:order-2">
    <Dropdown
      arrowIcon={false}
      inline
      label={
        <Avatar alt="User settings" img="https://flowbite.com/docs/images/people/profile-picture-5.jpg" rounded />
      }
    >
      <Dropdown.Header>
        <span className="block text-sm">Bonnie Green</span>
        <span className="block truncate text-sm font-medium">bonnie@flowbite.com</span>
      </Dropdown.Header>
      <Dropdown.Item>Dashboard</Dropdown.Item>
      <Dropdown.Item>Settings</Dropdown.Item>
      <Dropdown.Item>Earnings</Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item>Sign out</Dropdown.Item>
    </Dropdown>
    <Navbar.Toggle />
  </div>
  <Navbar.Collapse>
    <Navbar.Link href="#" active>
      Home
    </Navbar.Link>
    <Navbar.Link href="#">About</Navbar.Link>
    <Navbar.Link href="#">Services</Navbar.Link>
    <Navbar.Link href="#">Pricing</Navbar.Link>
    <Navbar.Link href="#">Contact</Navbar.Link>
  </Navbar.Collapse>
</Navbar>
```

### 18. Pagination Component
```typescript
import { Pagination } from 'flowbite-react';
import { useState } from 'react';

// Basic Pagination
const [currentPage, setCurrentPage] = useState(1);

<div className="flex overflow-x-auto sm:justify-center">
  <Pagination currentPage={currentPage} totalPages={100} onPageChange={setCurrentPage} />
</div>

// Pagination with Icons
<div className="flex overflow-x-auto sm:justify-center">
  <Pagination currentPage={currentPage} totalPages={100} onPageChange={setCurrentPage} showIcons />
</div>

// Pagination with Previous/Next Labels
<div className="flex overflow-x-auto sm:justify-center">
  <Pagination
    currentPage={currentPage}
    totalPages={100}
    onPageChange={setCurrentPage}
    showIcons
    previousLabel="Go back"
    nextLabel="Go forward"
  />
</div>

// Custom Pagination Layout
<div className="flex items-center justify-center text-center">
  <a
    href="#"
    className="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
  >
    <span className="sr-only">Previous</span>
    <svg className="w-2.5 h-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4"/>
    </svg>
  </a>
  <a href="#" className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">1</a>
  <a href="#" className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">2</a>
  <a href="#" aria-current="page" className="z-10 flex items-center justify-center px-3 h-8 leading-tight text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white">3</a>
  <a href="#" className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">4</a>
  <a href="#" className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">5</a>
  <a
    href="#"
    className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
  >
    <span className="sr-only">Next</span>
    <svg className="w-2.5 h-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
    </svg>
  </a>
</div>
```

### 19. Progress Bar Component
```typescript
import { Progress } from 'flowbite-react';

// Basic Progress Bar
<Progress progress={45} />

// Progress Bar with Label
<Progress progress={45} textLabel="Flowbite-React" />

// Progress Bar Sizes
<div className="text-base font-medium dark:text-white">Small</div>
<Progress progress={45} size="sm" />

<div className="text-base font-medium dark:text-white">Default</div>
<Progress progress={45} size="md" />

<div className="text-base font-medium dark:text-white">Large</div>
<Progress progress={45} size="lg" />

<div className="text-base font-medium dark:text-white">Extra Large</div>
<Progress progress={45} size="xl" />

// Progress Bar Colors
<div className="text-base font-medium text-blue-700 dark:text-blue-500">Blue</div>
<Progress progress={45} color="blue" />

<div className="text-base font-medium text-red-700 dark:text-red-500">Red</div>
<Progress progress={45} color="red" />

<div className="text-base font-medium text-green-700 dark:text-green-500">Green</div>
<Progress progress={45} color="green" />

<div className="text-base font-medium text-yellow-700 dark:text-yellow-500">Yellow</div>
<Progress progress={45} color="yellow" />

<div className="text-base font-medium text-indigo-700 dark:text-indigo-500">Indigo</div>
<Progress progress={45} color="indigo" />

<div className="text-base font-medium text-purple-700 dark:text-purple-500">Purple</div>
<Progress progress={45} color="purple" />

// Progress Bar with Label Inside
<Progress
  progress={50}
  textLabel="Flowbite-React"
  textLabelPosition="inside"
  size="lg"
  labelProgress
  labelText
/>
```

### 20. Rating Component
```typescript
import { Rating } from 'flowbite-react';

// Basic Rating
<Rating>
  <Rating.Star />
  <Rating.Star />
  <Rating.Star />
  <Rating.Star />
  <Rating.Star filled={false} />
</Rating>

// Rating with Text
<Rating>
  <Rating.Star />
  <Rating.Star />
  <Rating.Star />
  <Rating.Star />
  <Rating.Star filled={false} />
  <p className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">4.95 out of 5</p>
</Rating>

// Rating Sizes
<Rating size="sm">
  <Rating.Star />
  <Rating.Star />
  <Rating.Star />
  <Rating.Star />
  <Rating.Star filled={false} />
</Rating>

<Rating size="md">
  <Rating.Star />
  <Rating.Star />
  <Rating.Star />
  <Rating.Star />
  <Rating.Star filled={false} />
</Rating>

<Rating size="lg">
  <Rating.Star />
  <Rating.Star />
  <Rating.Star />
  <Rating.Star />
  <Rating.Star filled={false} />
</Rating>

// Count Rating
<Rating>
  <Rating.Star />
  <Rating.Star />
  <Rating.Star />
  <Rating.Star />
  <Rating.Star filled={false} />
  <p className="ml-2 text-sm font-medium text-gray-900 dark:text-white">4.95</p>
  <span className="mx-1.5 h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400" />
  <a href="#" className="text-sm font-medium text-gray-900 underline hover:no-underline dark:text-white">
    73 reviews
  </a>
</Rating>

// Advanced Rating with Review
<div className="mb-5">
  <div className="flex items-center mb-2">
    <Rating>
      <Rating.Star />
      <Rating.Star />
      <Rating.Star />
      <Rating.Star />
      <Rating.Star />
    </Rating>
    <p className="ml-2 text-sm font-medium text-gray-900 dark:text-white">4.95 out of 5</p>
  </div>
  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">1,745 global ratings</p>
  <div className="flex items-center mt-4">
    <a href="#" className="text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline">5 star</a>
    <div className="w-2/4 h-5 mx-4 bg-gray-200 rounded dark:bg-gray-700">
      <div className="h-5 bg-yellow-300 rounded" style={{ width: '70%' }}></div>
    </div>
    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">70%</span>
  </div>
  <div className="flex items-center mt-4">
    <a href="#" className="text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline">4 star</a>
    <div className="w-2/4 h-5 mx-4 bg-gray-200 rounded dark:bg-gray-700">
      <div className="h-5 bg-yellow-300 rounded" style={{ width: '17%' }}></div>
    </div>
    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">17%</span>
  </div>
</div>
```

### 21. Select Component
```typescript
import { Select, Label } from 'flowbite-react';

// Basic Select
<div className="max-w-md">
  <div className="mb-2 block">
    <Label htmlFor="countries" value="Select your country" />
  </div>
  <Select id="countries" required>
    <option>United States</option>
    <option>Canada</option>
    <option>France</option>
    <option>Germany</option>
  </Select>
</div>

// Select with Sizing
<div className="max-w-md">
  <div className="mb-2 block">
    <Label htmlFor="small" value="Small select" />
  </div>
  <Select id="small" sizing="sm">
    <option>United States</option>
    <option>Canada</option>
    <option>France</option>
    <option>Germany</option>
  </Select>
</div>

<div className="max-w-md">
  <div className="mb-2 block">
    <Label htmlFor="large" value="Large select" />
  </div>
  <Select id="large" sizing="lg">
    <option>United States</option>
    <option>Canada</option>
    <option>France</option>
    <option>Germany</option>
  </Select>
</div>

// Disabled Select
<div className="max-w-md">
  <div className="mb-2 block">
    <Label htmlFor="disabled" value="Disabled select" />
  </div>
  <Select id="disabled" disabled>
    <option>United States</option>
    <option>Canada</option>
    <option>France</option>
    <option>Germany</option>
  </Select>
</div>
```

### 22. Sidebar Component
```typescript
import { Sidebar } from 'flowbite-react';
import { HiArrowSmRight, HiChartPie, HiInbox, HiShoppingBag, HiTable, HiUser, HiViewBoards } from 'react-icons/hi';

// Basic Sidebar
<Sidebar aria-label="Default sidebar example">
  <Sidebar.Items>
    <Sidebar.ItemGroup>
      <Sidebar.Item href="#" icon={HiChartPie}>
        Dashboard
      </Sidebar.Item>
      <Sidebar.Item href="#" icon={HiViewBoards} label="Pro" labelColor="dark">
        Kanban
      </Sidebar.Item>
      <Sidebar.Item href="#" icon={HiInbox} label="3">
        Inbox
      </Sidebar.Item>
      <Sidebar.Item href="#" icon={HiUser}>
        Users
      </Sidebar.Item>
      <Sidebar.Item href="#" icon={HiShoppingBag}>
        Products
      </Sidebar.Item>
      <Sidebar.Item href="#" icon={HiArrowSmRight}>
        Sign In
      </Sidebar.Item>
      <Sidebar.Item href="#" icon={HiTable}>
        Sign Up
      </Sidebar.Item>
    </Sidebar.ItemGroup>
  </Sidebar.Items>
</Sidebar>

// Sidebar with Multi-level Dropdown
<Sidebar aria-label="Sidebar with multi-level dropdown example">
  <Sidebar.Items>
    <Sidebar.ItemGroup>
      <Sidebar.Item href="#" icon={HiChartPie}>
        Dashboard
      </Sidebar.Item>
      <Sidebar.Collapse icon={HiShoppingBag} label="E-commerce">
        <Sidebar.Item href="#">Products</Sidebar.Item>
        <Sidebar.Item href="#">Sales</Sidebar.Item>
        <Sidebar.Item href="#">Refunds</Sidebar.Item>
        <Sidebar.Item href="#">Shipping</Sidebar.Item>
      </Sidebar.Collapse>
      <Sidebar.Item href="#" icon={HiInbox}>
        Inbox
      </Sidebar.Item>
      <Sidebar.Item href="#" icon={HiUser}>
        Users
      </Sidebar.Item>
      <Sidebar.Item href="#" icon={HiArrowSmRight}>
        Sign In
      </Sidebar.Item>
      <Sidebar.Item href="#" icon={HiTable}>
        Sign Up
      </Sidebar.Item>
    </Sidebar.ItemGroup>
  </Sidebar.Items>
</Sidebar>

// Sidebar with CTA
<Sidebar aria-label="Sidebar with call to action button example">
  <Sidebar.Items>
    <Sidebar.ItemGroup>
      <Sidebar.Item href="#" icon={HiChartPie}>
        Dashboard
      </Sidebar.Item>
      <Sidebar.Item href="#" icon={HiViewBoards}>
        Kanban
      </Sidebar.Item>
      <Sidebar.Item href="#" icon={HiInbox}>
        Inbox
      </Sidebar.Item>
      <Sidebar.Item href="#" icon={HiUser}>
        Users
      </Sidebar.Item>
      <Sidebar.Item href="#" icon={HiShoppingBag}>
        Products
      </Sidebar.Item>
      <Sidebar.Item href="#" icon={HiArrowSmRight}>
        Sign In
      </Sidebar.Item>
      <Sidebar.Item href="#" icon={HiTable}>
        Sign Up
      </Sidebar.Item>
    </Sidebar.ItemGroup>
  </Sidebar.Items>
  <Sidebar.CTA>
    <div className="mb-3 flex items-center">
      <Badge color="warning">Beta</Badge>
    </div>
    <div className="mb-3 text-sm text-cyan-900 dark:text-gray-400">
      Preview the new Flowbite dashboard navigation! You can turn the new navigation off for a limited time in your
      profile.
    </div>
    <a
      href="#"
      className="text-sm text-cyan-900 underline hover:text-cyan-800 dark:text-gray-400 dark:hover:text-gray-300"
    >
      Turn new navigation off
    </a>
  </Sidebar.CTA>
</Sidebar>
```

### 23. Spinner Component
```typescript
import { Spinner } from 'flowbite-react';

// Basic Spinner
<Spinner aria-label="Default status example" />

// Spinner Colors
<div className="flex flex-wrap gap-2">
  <Spinner color="info" aria-label="Info spinner example" />
  <Spinner color="success" aria-label="Success spinner example" />
  <Spinner color="failure" aria-label="Failure spinner example" />
  <Spinner color="warning" aria-label="Warning spinner example" />
  <Spinner color="pink" aria-label="Pink spinner example" />
  <Spinner color="purple" aria-label="Purple spinner example" />
</div>

// Spinner Sizes
<div className="flex flex-wrap items-center gap-2">
  <Spinner size="xs" />
  <Spinner size="sm" />
  <Spinner size="md" />
  <Spinner size="lg" />
  <Spinner size="xl" />
</div>

// Spinner with Text
<div className="text-center">
  <Spinner aria-label="Center-aligned spinner example" />
  <span className="sr-only">Loading...</span>
</div>

<div className="flex items-center">
  <Spinner aria-label="Spinner button example" size="sm" />
  <span className="pl-3">Loading...</span>
</div>

// Button with Spinner
<Button>
  <Spinner aria-label="Spinner button example" size="sm" />
  <span className="pl-3">Loading...</span>
</Button>
```

### 24. Table Component
```typescript
import { Table } from 'flowbite-react';

// Basic Table
<div className="overflow-x-auto">
  <Table>
    <Table.Head>
      <Table.HeadCell>Product name</Table.HeadCell>
      <Table.HeadCell>Color</Table.HeadCell>
      <Table.HeadCell>Category</Table.HeadCell>
      <Table.HeadCell>Price</Table.HeadCell>
      <Table.HeadCell>
        <span className="sr-only">Edit</span>
      </Table.HeadCell>
    </Table.Head>
    <Table.Body className="divide-y">
      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          {'Apple MacBook Pro 17"'}
        </Table.Cell>
        <Table.Cell>Silver</Table.Cell>
        <Table.Cell>Laptop</Table.Cell>
        <Table.Cell>$2999</Table.Cell>
        <Table.Cell>
          <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
            Edit
          </a>
        </Table.Cell>
      </Table.Row>
      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          Microsoft Surface Pro
        </Table.Cell>
        <Table.Cell>White</Table.Cell>
        <Table.Cell>Laptop PC</Table.Cell>
        <Table.Cell>$1999</Table.Cell>
        <Table.Cell>
          <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
            Edit
          </a>
        </Table.Cell>
      </Table.Row>
      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">Magic Mouse 2</Table.Cell>
        <Table.Cell>Black</Table.Cell>
        <Table.Cell>Accessories</Table.Cell>
        <Table.Cell>$99</Table.Cell>
        <Table.Cell>
          <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
            Edit
          </a>
        </Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
</div>

// Striped Table
<div className="overflow-x-auto">
  <Table striped>
    <Table.Head>
      <Table.HeadCell>Product name</Table.HeadCell>
      <Table.HeadCell>Color</Table.HeadCell>
      <Table.HeadCell>Category</Table.HeadCell>
      <Table.HeadCell>Price</Table.HeadCell>
      <Table.HeadCell>
        <span className="sr-only">Edit</span>
      </Table.HeadCell>
    </Table.Head>
    <Table.Body className="divide-y">
      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          {'Apple MacBook Pro 17"'}
        </Table.Cell>
        <Table.Cell>Silver</Table.Cell>
        <Table.Cell>Laptop</Table.Cell>
        <Table.Cell>$2999</Table.Cell>
        <Table.Cell>
          <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
            Edit
          </a>
        </Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
</div>

// Hoverable Table
<div className="overflow-x-auto">
  <Table hoverable>
    <Table.Head>
      <Table.HeadCell>Product name</Table.HeadCell>
      <Table.HeadCell>Color</Table.HeadCell>
      <Table.HeadCell>Category</Table.HeadCell>
      <Table.HeadCell>Price</Table.HeadCell>
      <Table.HeadCell>
        <span className="sr-only">Edit</span>
      </Table.HeadCell>
    </Table.Head>
    <Table.Body className="divide-y">
      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          {'Apple MacBook Pro 17"'}
        </Table.Cell>
        <Table.Cell>Silver</Table.Cell>
        <Table.Cell>Laptop</Table.Cell>
        <Table.Cell>$2999</Table.Cell>
        <Table.Cell>
          <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
            Edit
          </a>
        </Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
</div>

// Table with Checkbox
<div className="overflow-x-auto">
  <Table hoverable>
    <Table.Head>
      <Table.HeadCell className="p-4">
        <Checkbox />
      </Table.HeadCell>
      <Table.HeadCell>Product name</Table.HeadCell>
      <Table.HeadCell>Color</Table.HeadCell>
      <Table.HeadCell>Category</Table.HeadCell>
      <Table.HeadCell>Price</Table.HeadCell>
      <Table.HeadCell>
        <span className="sr-only">Edit</span>
      </Table.HeadCell>
    </Table.Head>
    <Table.Body className="divide-y">
      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell className="p-4">
          <Checkbox />
        </Table.Cell>
        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          {'Apple MacBook Pro 17"'}
        </Table.Cell>
        <Table.Cell>Silver</Table.Cell>
        <Table.Cell>Laptop</Table.Cell>
        <Table.Cell>$2999</Table.Cell>
        <Table.Cell>
          <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
            Edit
          </a>
        </Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
</div>
```

### 25. Tabs Component
```typescript
import { Tabs } from 'flowbite-react';
import { HiAdjustments, HiClipboardList, HiUserCircle } from 'react-icons/hi';
import { MdDashboard } from 'react-icons/md';

// Basic Tabs
<Tabs aria-label="Default tabs" style="default">
  <Tabs.Item active title="Profile">
    <p className="text-sm text-gray-500 dark:text-gray-400">
      This is some placeholder content the <strong className="font-medium text-gray-800 dark:text-white">Profile tab's associated content</strong>.
      Clicking another tab will toggle the visibility of this one for the next. The tab JavaScript swaps classes to control the content visibility and styling.
    </p>
  </Tabs.Item>
  <Tabs.Item title="Dashboard">
    <p className="text-sm text-gray-500 dark:text-gray-400">
      This is some placeholder content the <strong className="font-medium text-gray-800 dark:text-white">Dashboard tab's associated content</strong>.
      Clicking another tab will toggle the visibility of this one for the next. The tab JavaScript swaps classes to control the content visibility and styling.
    </p>
  </Tabs.Item>
  <Tabs.Item title="Settings">
    <p className="text-sm text-gray-500 dark:text-gray-400">
      This is some placeholder content the <strong className="font-medium text-gray-800 dark:text-white">Settings tab's associated content</strong>.
      Clicking another tab will toggle the visibility of this one for the next. The tab JavaScript swaps classes to control the content visibility and styling.
    </p>
  </Tabs.Item>
  <Tabs.Item title="Contacts">
    <p className="text-sm text-gray-500 dark:text-gray-400">
      This is some placeholder content the <strong className="font-medium text-gray-800 dark:text-white">Contacts tab's associated content</strong>.
      Clicking another tab will toggle the visibility of this one for the next. The tab JavaScript swaps classes to control the content visibility and styling.
    </p>
  </Tabs.Item>
  <Tabs.Item disabled title="Disabled">
    <p className="text-sm text-gray-500 dark:text-gray-400">Disabled content</p>
  </Tabs.Item>
</Tabs>

// Tabs with Icons
<Tabs aria-label="Tabs with icons" style="underline">
  <Tabs.Item active title="Profile" icon={HiUserCircle}>
    <p className="text-sm text-gray-500 dark:text-gray-400">
      This is some placeholder content the <strong className="font-medium text-gray-800 dark:text-white">Profile tab's associated content</strong>.
      Clicking another tab will toggle the visibility of this one for the next. The tab JavaScript swaps classes to control the content visibility and styling.
    </p>
  </Tabs.Item>
  <Tabs.Item title="Dashboard" icon={MdDashboard}>
    <p className="text-sm text-gray-500 dark:text-gray-400">
      This is some placeholder content the <strong className="font-medium text-gray-800 dark:text-white">Dashboard tab's associated content</strong>.
      Clicking another tab will toggle the visibility of this one for the next. The tab JavaScript swaps classes to control the content visibility and styling.
    </p>
  </Tabs.Item>
  <Tabs.Item title="Settings" icon={HiAdjustments}>
    <p className="text-sm text-gray-500 dark:text-gray-400">
      This is some placeholder content the <strong className="font-medium text-gray-800 dark:text-white">Settings tab's associated content</strong>.
      Clicking another tab will toggle the visibility of this one for the next. The tab JavaScript swaps classes to control the content visibility and styling.
    </p>
  </Tabs.Item>
  <Tabs.Item title="Contacts" icon={HiClipboardList}>
    <p className="text-sm text-gray-500 dark:text-gray-400">
      This is some placeholder content the <strong className="font-medium text-gray-800 dark:text-white">Contacts tab's associated content</strong>.
      Clicking another tab will toggle the visibility of this one for the next. The tab JavaScript swaps classes to control the content visibility and styling.
    </p>
  </Tabs.Item>
</Tabs>

// Pills Style Tabs
<Tabs aria-label="Pills" style="pills">
  <Tabs.Item active title="Tab 1">
    <p className="text-sm text-gray-500 dark:text-gray-400">Content 1</p>
  </Tabs.Item>
  <Tabs.Item title="Tab 2">
    <p className="text-sm text-gray-500 dark:text-gray-400">Content 2</p>
  </Tabs.Item>
  <Tabs.Item title="Tab 3">
    <p className="text-sm text-gray-500 dark:text-gray-400">Content 3</p>
  </Tabs.Item>
  <Tabs.Item title="Tab 4">
    <p className="text-sm text-gray-500 dark:text-gray-400">Content 4</p>
  </Tabs.Item>
  <Tabs.Item disabled title="Tab 5">
    <p className="text-sm text-gray-500 dark:text-gray-400">Content 5</p>
  </Tabs.Item>
</Tabs>

// Full Width Tabs
<Tabs aria-label="Full width tabs" style="fullWidth">
  <Tabs.Item title="Profile" icon={HiUserCircle}>
    <p className="text-sm text-gray-500 dark:text-gray-400">Profile content</p>
  </Tabs.Item>
  <Tabs.Item active title="Dashboard" icon={MdDashboard}>
    <p className="text-sm text-gray-500 dark:text-gray-400">Dashboard content</p>
  </Tabs.Item>
  <Tabs.Item title="Settings" icon={HiAdjustments}>
    <p className="text-sm text-gray-500 dark:text-gray-400">Settings content</p>
  </Tabs.Item>
  <Tabs.Item title="Invoice" icon={HiClipboardList}>
    <p className="text-sm text-gray-500 dark:text-gray-400">Invoice content</p>
  </Tabs.Item>
</Tabs>
```

### 26. TextInput Component
```typescript
import { TextInput, Label } from 'flowbite-react';
import { HiMail } from 'react-icons/hi';

// Basic Text Input
<div className="max-w-md">
  <div className="mb-2 block">
    <Label htmlFor="email1" value="Your email" />
  </div>
  <TextInput id="email1" type="email" placeholder="name@flowbite.com" required />
</div>

// Text Input Sizes
<div className="flex max-w-md flex-col gap-4">
  <div>
    <div className="mb-2 block">
      <Label htmlFor="small" value="Small input" />
    </div>
    <TextInput id="small" type="text" sizing="sm" />
  </div>
  <div>
    <div className="mb-2 block">
      <Label htmlFor="base" value="Base input" />
    </div>
    <TextInput id="base" type="text" sizing="md" />
  </div>
  <div>
    <div className="mb-2 block">
      <Label htmlFor="large" value="Large input" />
    </div>
    <TextInput id="large" type="text" sizing="lg" />
  </div>
</div>

// Disabled Text Input
<div className="max-w-md">
  <div className="mb-2 block">
    <Label htmlFor="disabledInput1" value="Disabled input" />
  </div>
  <TextInput id="disabledInput1" type="text" placeholder="Disabled input" disabled />
</div>

// Text Input with Icon
<div className="max-w-md">
  <div className="mb-2 block">
    <Label htmlFor="email4" value="Your email" />
  </div>
  <TextInput id="email4" type="email" icon={HiMail} placeholder="name@flowbite.com" required />
</div>

// Text Input with Helper Text
<div className="max-w-md">
  <div className="mb-2 block">
    <Label htmlFor="email3" value="Your email" />
  </div>
  <TextInput
    id="email3"
    type="email"
    placeholder="name@flowbite.com"
    required
    helperText={
      <>
        We'll never share your details. Read our{' '}
        <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
          Privacy Policy
        </a>
        .
      </>
    }
  />
</div>

// Text Input with Validation States
<div className="flex max-w-md flex-col gap-4">
  <div>
    <div className="mb-2 block">
      <Label htmlFor="success" value="Success input" />
    </div>
    <TextInput id="success" type="text" color="success" placeholder="Success input" />
  </div>
  <div>
    <div className="mb-2 block">
      <Label htmlFor="failure" value="Failure input" />
    </div>
    <TextInput id="failure" type="text" color="failure" placeholder="Failure input" />
  </div>
</div>
```

### 27. Timeline Component
```typescript
import { Timeline } from 'flowbite-react';
import { HiArrowNarrowRight, HiCalendar } from 'react-icons/hi';

// Basic Timeline
<Timeline>
  <Timeline.Item>
    <Timeline.Point />
    <Timeline.Content>
      <Timeline.Time>February 2022</Timeline.Time>
      <Timeline.Title>Application UI code in Tailwind CSS</Timeline.Title>
      <Timeline.Body>
        Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order
        E-commerce & Marketing pages.
      </Timeline.Body>
      <Button color="gray">
        Learn More
        <HiArrowNarrowRight className="ml-2 h-3 w-3" />
      </Button>
    </Timeline.Content>
  </Timeline.Item>
  <Timeline.Item>
    <Timeline.Point />
    <Timeline.Content>
      <Timeline.Time>March 2022</Timeline.Time>
      <Timeline.Title>Marketing UI design in Figma</Timeline.Title>
      <Timeline.Body>
        All of the pages and components are first designed in Figma and we keep a parity between the two versions
        even as we update the project.
      </Timeline.Body>
    </Timeline.Content>
  </Timeline.Item>
  <Timeline.Item>
    <Timeline.Point />
    <Timeline.Content>
      <Timeline.Time>April 2022</Timeline.Time>
      <Timeline.Title>E-Commerce UI code in Tailwind CSS</Timeline.Title>
      <Timeline.Body>
        Get started with dozens of web components and interactive elements built on top of Tailwind CSS.
      </Timeline.Body>
    </Timeline.Content>
  </Timeline.Item>
</Timeline>

// Timeline with Icons
<Timeline>
  <Timeline.Item>
    <Timeline.Point icon={HiCalendar} />
    <Timeline.Content>
      <Timeline.Time>February 2022</Timeline.Time>
      <Timeline.Title>Application UI code in Tailwind CSS</Timeline.Title>
      <Timeline.Body>
        Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order
        E-commerce & Marketing pages.
      </Timeline.Body>
    </Timeline.Content>
  </Timeline.Item>
  <Timeline.Item>
    <Timeline.Point icon={HiCalendar} />
    <Timeline.Content>
      <Timeline.Time>March 2022</Timeline.Time>
      <Timeline.Title>Marketing UI design in Figma</Timeline.Title>
      <Timeline.Body>
        All of the pages and components are first designed in Figma and we keep a parity between the two versions
        even as we update the project.
      </Timeline.Body>
    </Timeline.Content>
  </Timeline.Item>
</Timeline>

// Horizontal Timeline
<Timeline horizontal>
  <Timeline.Item>
    <Timeline.Point icon={HiCalendar} />
    <Timeline.Content>
      <Timeline.Time>February 2022</Timeline.Time>
      <Timeline.Title>Application UI code in Tailwind CSS</Timeline.Title>
      <Timeline.Body>
        Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order
        E-commerce & Marketing pages.
      </Timeline.Body>
    </Timeline.Content>
  </Timeline.Item>
  <Timeline.Item>
    <Timeline.Point icon={HiCalendar} />
    <Timeline.Content>
      <Timeline.Time>March 2022</Timeline.Time>
      <Timeline.Title>Marketing UI design in Figma</Timeline.Title>
      <Timeline.Body>
        All of the pages and components are first designed in Figma and we keep a parity between the two versions
        even as we update the project.
      </Timeline.Body>
    </Timeline.Content>
  </Timeline.Item>
</Timeline>
```

### 28. Toast Component
```typescript
import { Toast } from 'flowbite-react';
import { HiFire, HiCheck, HiExclamation, HiX } from 'react-icons/hi';

// Basic Toast
<Toast>
  <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-500 dark:bg-cyan-800 dark:text-cyan-200">
    <HiFire className="h-5 w-5" />
  </div>
  <div className="ml-3 text-sm font-normal">Set yourself free.</div>
  <Toast.Toggle />
</Toast>

// Success Toast
<Toast>
  <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
    <HiCheck className="h-5 w-5" />
  </div>
  <div className="ml-3 text-sm font-normal">Item moved successfully.</div>
  <Toast.Toggle />
</Toast>

// Warning Toast
<Toast>
  <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500 dark:bg-orange-700 dark:text-orange-200">
    <HiExclamation className="h-5 w-5" />
  </div>
  <div className="ml-3 text-sm font-normal">Improve password difficulty.</div>
  <Toast.Toggle />
</Toast>

// Error Toast
<Toast>
  <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
    <HiX className="h-5 w-5" />
  </div>
  <div className="ml-3 text-sm font-normal">Item has been deleted.</div>
  <Toast.Toggle />
</Toast>

// Interactive Toast
<Toast>
  <div className="text-sm font-normal">
    Conversation archived.
    <div className="mt-3 flex divide-x divide-gray-200 dark:divide-gray-700">
      <button className="inline-flex px-2 py-1.5 text-xs font-medium text-center text-blue-600 bg-transparent border-0 hover:underline dark:text-blue-500">
        Undo
      </button>
      <button className="inline-flex px-2 py-1.5 pl-3 text-xs font-medium text-center text-gray-900 bg-transparent border-0 hover:underline dark:text-white">
        Dismiss
      </button>
    </div>
  </div>
  <Toast.Toggle />
</Toast>
```

### 29. Tooltip Component
```typescript
import { Tooltip, Button } from 'flowbite-react';

// Basic Tooltip
<Tooltip content="Tooltip content">
  <Button>Default tooltip</Button>
</Tooltip>

// Tooltip Styles
<div className="flex flex-wrap gap-2">
  <Tooltip content="Tooltip content" style="dark">
    <Button>Dark tooltip</Button>
  </Tooltip>
  <Tooltip content="Tooltip content" style="light">
    <Button>Light tooltip</Button>
  </Tooltip>
  <Tooltip content="Tooltip content" style="auto">
    <Button>Auto tooltip</Button>
  </Tooltip>
</div>

// Tooltip Placement
<div className="flex flex-wrap gap-2">
  <Tooltip content="Tooltip content" placement="top">
    <Button>Tooltip top</Button>
  </Tooltip>
  <Tooltip content="Tooltip content" placement="right">
    <Button>Tooltip right</Button>
  </Tooltip>
  <Tooltip content="Tooltip content" placement="bottom">
    <Button>Tooltip bottom</Button>
  </Tooltip>
  <Tooltip content="Tooltip content" placement="left">
    <Button>Tooltip left</Button>
  </Tooltip>
</div>

// Tooltip Trigger
<div className="flex flex-wrap gap-2">
  <Tooltip content="Tooltip content" trigger="hover">
    <Button>Tooltip hover</Button>
  </Tooltip>
  <Tooltip content="Tooltip content" trigger="click">
    <Button>Tooltip click</Button>
  </Tooltip>
</div>

// Custom Tooltip Content
<Tooltip
  content={
    <div className="w-64 text-sm text-gray-500 dark:text-gray-400">
      <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Tooltip with HTML</h3>
      </div>
      <div className="px-3 py-2">
        <p>And here's some amazing content. It's very engaging. Right?</p>
      </div>
    </div>
  }
>
  <Button>Tooltip with HTML</Button>
</Tooltip>
```

## Performance Optimization

### Code Splitting and Lazy Loading
```typescript
import { lazy, Suspense } from 'react';
import { Spinner } from 'flowbite-react';

// Lazy load Flowbite components for better performance
const Modal = lazy(() => import('flowbite-react').then(module => ({ default: module.Modal })));
const Table = lazy(() => import('flowbite-react').then(module => ({ default: module.Table })));

// Use with Suspense
<Suspense fallback={<Spinner />}>
  <Modal show={isOpen} onClose={() => setIsOpen(false)}>
    <Modal.Header>Lazy Loaded Modal</Modal.Header>
    <Modal.Body>Content here</Modal.Body>
  </Modal>
</Suspense>
```

### Memoization for Performance
```typescript
import { memo, useMemo, useCallback } from 'react';
import { Button, Card } from 'flowbite-react';

// Memoize Flowbite components to prevent unnecessary re-renders
const MemoizedCard = memo(({ title, content, onAction }: CardProps) => {
  const handleClick = useCallback(() => {
    onAction?.(title);
  }, [title, onAction]);

  const cardContent = useMemo(() => (
    <Card.Content>
      <p className="font-normal text-gray-700 dark:text-gray-400">
        {content}
      </p>
    </Card.Content>
  ), [content]);

  return (
    <Card className="max-w-sm">
      <Card.Header>
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h5>
      </Card.Header>
      {cardContent}
      <Button onClick={handleClick}>
        Read more
      </Button>
    </Card>
  );
});
```

## Testing Guidelines

### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, Modal } from 'flowbite-react';
import { vi } from 'vitest';

// Test Flowbite React components
describe('Modal Component', () => {
  it('should render modal when show is true', () => {
    const onClose = vi.fn();
    
    render(
      <Modal show={true} onClose={onClose}>
        <Modal.Header>Test Modal</Modal.Header>
        <Modal.Body>Test content</Modal.Body>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    
    render(
      <Modal show={true} onClose={onClose}>
        <Modal.Header>Test Modal</Modal.Header>
      </Modal>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('Button Component', () => {
  it('should render with correct color and size', () => {
    render(
      <Button color="blue" size="lg">
        Test Button
      </Button>
    );

    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toHaveClass('bg-blue-700', 'text-lg');
  });
});
```

## Migration Guide

### From Custom Components to Flowbite React
```typescript
// Before: Custom button component
const CustomButton = ({ variant, size, children, ...props }) => (
  <button 
    className={`btn btn-${variant} btn-${size}`} 
    {...props}
  >
    {children}
  </button>
);

// After: Flowbite React Button
import { Button } from 'flowbite-react';

const FlowbiteButton = ({ color, size, children, ...props }) => (
  <Button color={color} size={size} {...props}>
    {children}
  </Button>
);

// Migration mapping
const colorMapping = {
  primary: 'blue',
  secondary: 'gray',
  success: 'green',
  danger: 'red',
  warning: 'yellow',
};

const sizeMapping = {
  small: 'sm',
  medium: 'md', 
  large: 'lg',
};
```

## Troubleshooting

### Common Issues and Solutions

1. **Theme not applying correctly**
```typescript
// Ensure ThemeProvider wraps your app
import { Flowbite } from 'flowbite-react';

function App() {
  return (
    <Flowbite>
      <YourAppContent />
    </Flowbite>
  );
}
```

2. **TypeScript errors with props**
```typescript
// Use proper prop interfaces
import type { ButtonProps } from 'flowbite-react';

interface CustomButtonProps extends ButtonProps {
  customProp?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({ customProp, ...props }) => (
  <Button {...props}>Button with custom prop</Button>
);
```

3. **SSR hydration issues**
```typescript
// Use dynamic imports for client-side only components
import dynamic from 'next/dynamic';

const ClientOnlyModal = dynamic(
  () => import('flowbite-react').then(mod => mod.Modal),
  { ssr: false }
);
```