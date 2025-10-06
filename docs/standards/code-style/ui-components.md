# UI Components Standards

## Component Hierarchy

### Priority Order
1. **shadcn/ui Components** - First choice for all UI elements (built on Radix UI + Tailwind)
2. **Extended shadcn/ui Components** - Custom variants/styling on shadcn/ui base
3. **Custom Components** - Only when shadcn/ui doesn't provide functionality

## Core Components Usage

### Navigation Components

#### Navbar
```typescript
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, X } from "lucide-react";

// ✅ Standard navbar with user menu
<nav className="border-b bg-background">
  <div className="flex h-16 items-center px-4">
    <div className="flex items-center space-x-4">
      <img src="/logo.svg" className="h-8 w-8" alt="Logo" />
      <span className="text-xl font-semibold">Brand Name</span>
    </div>
    
    <div className="ml-auto flex items-center space-x-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/user-avatar.jpg" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">john@example.com</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Dashboard</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</nav>
```

#### Sidebar
```typescript
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Inbox, Users, ShoppingBag } from "lucide-react";

// ✅ Admin sidebar navigation
<aside className="flex h-full w-64 flex-col border-r bg-background">
  <nav className="flex-1 space-y-2 p-4">
    <div className="space-y-1">
      <Button
        variant="ghost"
        className="w-full justify-start"
        asChild
      >
        <a href="/dashboard" className="flex items-center">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </a>
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        asChild
      >
        <a href="/inbox" className="flex items-center">
          <Inbox className="mr-2 h-4 w-4" />
          Inbox
          <Badge variant="secondary" className="ml-auto">3</Badge>
        </a>
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        asChild
      >
        <a href="/users" className="flex items-center">
          <Users className="mr-2 h-4 w-4" />
          Users
        </a>
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        asChild
      >
        <a href="/products" className="flex items-center">
          <ShoppingBag className="mr-2 h-4 w-4" />
          Products
        </a>
      </Button>
    </div>
  </nav>
</aside>
```

### Form Components

#### Complete Form Example
```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ✅ Comprehensive form with validation
<form className="space-y-6" onSubmit={handleSubmit}>
  <div className="space-y-2">
    <Label htmlFor="firstName">First Name</Label>
    <Input
      id="firstName"
      type="text"
      placeholder="Enter your first name"
      required
      value={formData.firstName}
      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
    />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="email">Email Address</Label>
    <Input
      id="email"
      type="email"
      placeholder="name@company.com"
      required
      value={formData.email}
      onChange={(e) => setFormData({...formData, email: e.target.value})}
    />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="role">Select Role</Label>
    <Select
      value={formData.role}
      onValueChange={(value) => setFormData({...formData, role: value})}
    >
      <SelectTrigger>
        <SelectValue placeholder="Choose a role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Administrator</SelectItem>
        <SelectItem value="user">User</SelectItem>
        <SelectItem value="moderator">Moderator</SelectItem>
      </SelectContent>
    </Select>
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="bio">Bio</Label>
    <Textarea
      id="bio"
      placeholder="Tell us about yourself..."
      rows={4}
      value={formData.bio}
      onChange={(e) => setFormData({...formData, bio: e.target.value})}
    />
  </div>
  
  <div className="flex items-center space-x-2">
    <Checkbox
      id="terms"
      checked={formData.acceptTerms}
      onCheckedChange={(checked) => setFormData({...formData, acceptTerms: checked as boolean})}
    />
    <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      I agree with the{" "}
      <a href="/terms" className="text-primary hover:underline">
        terms and conditions
      </a>
    </Label>
  </div>
  
  <Button type="submit" className="w-full">
    Create Account
  </Button>
</form>
```

### Data Display Components

#### Table with Actions
```typescript
import { Table, Badge, Button, Dropdown } from 'flowbite-react';
import { HiDotsVertical } from 'react-icons/hi';

// ✅ Data table with status and actions
<Table hoverable>
  <Table.Head>
    <Table.HeadCell>Name</Table.HeadCell>
    <Table.HeadCell>Email</Table.HeadCell>
    <Table.HeadCell>Status</Table.HeadCell>
    <Table.HeadCell>
      <span className="sr-only">Actions</span>
    </Table.HeadCell>
  </Table.Head>
  <Table.Body className="divide-y">
    {users.map((user) => (
      <Table.Row key={user.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          {user.name}
        </Table.Cell>
        <Table.Cell>{user.email}</Table.Cell>
        <Table.Cell>
          <Badge color={user.status === 'active' ? 'success' : 'failure'}>
            {user.status}
          </Badge>
        </Table.Cell>
        <Table.Cell>
          <Dropdown
            arrowIcon={false}
            inline
            label={<HiDotsVertical className="h-4 w-4" />}
          >
            <Dropdown.Item>Edit</Dropdown.Item>
            <Dropdown.Item>Delete</Dropdown.Item>
          </Dropdown>
        </Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>
```

#### Card Layouts
```typescript
import { Card, Button, Badge } from 'flowbite-react';

// ✅ Product card with image and actions
<Card className="max-w-sm">
  <div className="relative">
    <img
      src="/product-image.jpg"
      alt="Product"
      className="h-48 w-full object-cover"
    />
    <Badge color="success" className="absolute top-2 right-2">
      New
    </Badge>
  </div>
  
  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
    Product Name
  </h5>
  
  <p className="font-normal text-gray-700 dark:text-gray-400">
    Product description goes here with key features and benefits.
  </p>
  
  <div className="flex items-center justify-between">
    <span className="text-3xl font-bold text-gray-900 dark:text-white">
      $599
    </span>
    <Button>Add to cart</Button>
  </div>
</Card>
```

### Modal Components

#### Confirmation Modal
```typescript
import { Modal, Button } from 'flowbite-react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

// ✅ Delete confirmation modal
<Modal show={showModal} size="md" onClose={() => setShowModal(false)} popup>
  <Modal.Header />
  <Modal.Body>
    <div className="text-center">
      <HiOutlineExclamationTriangle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
      <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
        Are you sure you want to delete this item?
      </h3>
      <div className="flex justify-center gap-4">
        <Button color="failure" onClick={handleDelete}>
          Yes, I'm sure
        </Button>
        <Button color="gray" onClick={() => setShowModal(false)}>
          No, cancel
        </Button>
      </div>
    </div>
  </Modal.Body>
</Modal>
```

### Feedback Components

#### Toast Notifications
```typescript
import { Toast } from 'flowbite-react';
import { HiCheck, HiExclamation, HiX } from 'react-icons/hi';

// ✅ Success toast
<Toast>
  <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
    <HiCheck className="h-5 w-5" />
  </div>
  <div className="ml-3 text-sm font-normal">Item moved successfully.</div>
  <Toast.Toggle />
</Toast>

// ✅ Error toast
<Toast>
  <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
    <HiX className="h-5 w-5" />
  </div>
  <div className="ml-3 text-sm font-normal">Something went wrong.</div>
  <Toast.Toggle />
</Toast>
```

#### Loading States
```typescript
import { Spinner, Button } from 'flowbite-react';

// ✅ Loading button
<Button disabled={loading}>
  {loading && <Spinner aria-label="Loading" size="sm" />}
  {loading ? 'Processing...' : 'Submit'}
</Button>

// ✅ Page loading
<div className="flex justify-center items-center min-h-screen">
  <div className="text-center">
    <Spinner aria-label="Loading page" size="xl" />
    <p className="mt-4 text-gray-600">Loading...</p>
  </div>
</div>
```

## Component Composition Patterns

### Layout Wrapper
```typescript
import { Navbar, Sidebar, Footer } from 'flowbite-react';

// ✅ Standard app layout
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="flex">
        <Sidebar className="w-64" />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
```

### Form Sections
```typescript
import { Card, Label, TextInput, Button } from 'flowbite-react';

// ✅ Sectioned form layout
<div className="space-y-6">
  <Card>
    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="firstName" value="First Name" />
        <TextInput id="firstName" type="text" required />
      </div>
      <div>
        <Label htmlFor="lastName" value="Last Name" />
        <TextInput id="lastName" type="text" required />
      </div>
    </div>
  </Card>
  
  <Card>
    <h3 className="text-lg font-semibold mb-4">Contact Details</h3>
    <div className="space-y-4">
      <div>
        <Label htmlFor="email" value="Email" />
        <TextInput id="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="phone" value="Phone" />
        <TextInput id="phone" type="tel" />
      </div>
    </div>
  </Card>
  
  <div className="flex justify-end">
    <Button type="submit">Save Changes</Button>
  </div>
</div>
```

## Accessibility Requirements

### ARIA Labels and Roles
```typescript
// ✅ Proper accessibility attributes
<Button
  aria-label="Close dialog"
  aria-describedby="close-description"
  onClick={handleClose}
>
  <HiX className="h-4 w-4" />
</Button>
<div id="close-description" className="sr-only">
  Closes the current dialog without saving changes
</div>
```

### Focus Management
```typescript
import { useRef, useEffect } from 'react';
import { Modal, Button } from 'flowbite-react';

// ✅ Focus management in modals
function AccessibleModal({ show, onClose }: ModalProps) {
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (show && firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, [show]);
  
  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>Modal Title</Modal.Header>
      <Modal.Body>
        <p>Modal content here</p>
      </Modal.Body>
      <Modal.Footer>
        <Button ref={firstButtonRef} onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```

## Advanced Component Patterns

### Data Visualization Components

#### Progress Indicators
```typescript
import { Progress, Card } from 'flowbite-react';

// ✅ Dashboard progress cards
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card>
    <div className="flex items-center justify-between mb-2">
      <h5 className="text-lg font-semibold">Sales Target</h5>
      <span className="text-sm text-gray-500">75%</span>
    </div>
    <Progress progress={75} color="blue" size="lg" />
    <p className="text-sm text-gray-600 mt-2">$75,000 of $100,000 goal</p>
  </Card>
  
  <Card>
    <div className="flex items-center justify-between mb-2">
      <h5 className="text-lg font-semibold">Project Completion</h5>
      <span className="text-sm text-gray-500">92%</span>
    </div>
    <Progress progress={92} color="green" size="lg" />
    <p className="text-sm text-gray-600 mt-2">23 of 25 tasks completed</p>
  </Card>
  
  <Card>
    <div className="flex items-center justify-between mb-2">
      <h5 className="text-lg font-semibold">Storage Usage</h5>
      <span className="text-sm text-gray-500">45%</span>
    </div>
    <Progress progress={45} color="yellow" size="lg" />
    <p className="text-sm text-gray-600 mt-2">4.5 GB of 10 GB used</p>
  </Card>
</div>
```

#### Rating and Reviews
```typescript
import { Rating, Card, Avatar, Button } from 'flowbite-react';

// ✅ Review card with rating
<Card className="max-w-md">
  <div className="flex items-center space-x-4">
    <Avatar img="/user-avatar.jpg" alt="Reviewer" rounded />
    <div className="flex-1">
      <h5 className="text-lg font-semibold">John Smith</h5>
      <div className="flex items-center space-x-2">
        <Rating>
          <Rating.Star />
          <Rating.Star />
          <Rating.Star />
          <Rating.Star />
          <Rating.Star filled={false} />
        </Rating>
        <span className="text-sm text-gray-500">4.0</span>
      </div>
    </div>
  </div>
  
  <p className="text-gray-700 dark:text-gray-400 mt-4">
    "Great product! Really helped streamline our workflow. The interface is 
    intuitive and the customer support is excellent."
  </p>
  
  <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
    <span>2 days ago</span>
    <Button size="xs" color="gray">Helpful</Button>
  </div>
</Card>
```

### Interactive Components

#### Tabs with Dynamic Content
```typescript
import { Tabs, Card, Badge } from 'flowbite-react';
import { HiUser, HiCog, HiBell, HiLockClosed } from 'react-icons/hi';

// ✅ Settings tabs with icons
<Tabs aria-label="Settings tabs" style="underline">
  <Tabs.Item active title="Profile" icon={HiUser}>
    <Card>
      <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar size="lg" img="/profile.jpg" alt="Profile" />
          <div>
            <h4 className="font-medium">Profile Picture</h4>
            <p className="text-sm text-gray-500">Update your profile image</p>
            <Button size="sm" className="mt-2">Change Photo</Button>
          </div>
        </div>
      </div>
    </Card>
  </Tabs.Item>
  
  <Tabs.Item title="Account" icon={HiCog}>
    <Card>
      <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-500">Add an extra layer of security</p>
          </div>
          <Badge color="success">Enabled</Badge>
        </div>
      </div>
    </Card>
  </Tabs.Item>
  
  <Tabs.Item title="Notifications" icon={HiBell}>
    <Card>
      <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Email Notifications</h4>
            <p className="text-sm text-gray-500">Receive updates via email</p>
          </div>
          <Toggle checked={emailNotifications} onChange={setEmailNotifications} />
        </div>
      </div>
    </Card>
  </Tabs.Item>
  
  <Tabs.Item title="Privacy" icon={HiLockClosed}>
    <Card>
      <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Profile Visibility</h4>
            <p className="text-sm text-gray-500">Control who can see your profile</p>
          </div>
          <Select sizing="sm" className="w-32">
            <option>Public</option>
            <option>Friends</option>
            <option>Private</option>
          </Select>
        </div>
      </div>
    </Card>
  </Tabs.Item>
</Tabs>
```

#### Accordion with Rich Content
```typescript
import { Accordion, Badge, Button } from 'flowbite-react';

// ✅ FAQ accordion with rich content
<Accordion>
  <Accordion.Panel>
    <Accordion.Title>
      <div className="flex items-center justify-between w-full">
        <span>What is included in the Pro plan?</span>
        <Badge color="info">Popular</Badge>
      </div>
    </Accordion.Title>
    <Accordion.Content>
      <div className="space-y-4">
        <p className="text-gray-500 dark:text-gray-400">
          The Pro plan includes all features from the Basic plan plus:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-500 dark:text-gray-400">
          <li>Advanced analytics and reporting</li>
          <li>Priority customer support</li>
          <li>Custom integrations</li>
          <li>Team collaboration tools</li>
        </ul>
        <Button size="sm">Upgrade to Pro</Button>
      </div>
    </Accordion.Content>
  </Accordion.Panel>
  
  <Accordion.Panel>
    <Accordion.Title>How do I cancel my subscription?</Accordion.Title>
    <Accordion.Content>
      <div className="space-y-4">
        <p className="text-gray-500 dark:text-gray-400">
          You can cancel your subscription at any time from your account settings:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-500 dark:text-gray-400">
          <li>Go to Account Settings</li>
          <li>Click on "Billing & Subscription"</li>
          <li>Select "Cancel Subscription"</li>
          <li>Confirm your cancellation</li>
        </ol>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> You'll continue to have access until the end of your billing period.
          </p>
        </div>
      </div>
    </Accordion.Content>
  </Accordion.Panel>
</Accordion>
```

### Complex Layout Patterns

#### Dashboard Grid Layout
```typescript
import { Card, Button, Badge, Progress, Table } from 'flowbite-react';
import { HiTrendingUp, HiUsers, HiShoppingCart, HiCurrencyDollar } from 'react-icons/hi';

// ✅ Complete dashboard layout
<div className="space-y-6">
  {/* Stats Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <Card>
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
          <HiCurrencyDollar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">$45,231.89</p>
          <p className="text-xs text-green-600">+20.1% from last month</p>
        </div>
      </div>
    </Card>
    
    <Card>
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
          <HiUsers className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Users</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">2,350</p>
          <p className="text-xs text-green-600">+180.1% from last month</p>
        </div>
      </div>
    </Card>
    
    <Card>
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
          <HiShoppingCart className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sales</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">12,234</p>
          <p className="text-xs text-green-600">+19% from last month</p>
        </div>
      </div>
    </Card>
    
    <Card>
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
          <HiTrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Growth</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">+573</p>
          <p className="text-xs text-green-600">+201 since last hour</p>
        </div>
      </div>
    </Card>
  </div>
  
  {/* Charts and Tables Row */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Orders</h3>
        <Button size="sm" color="gray">View All</Button>
      </div>
      <Table>
        <Table.Head>
          <Table.HeadCell>Customer</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell>Amount</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>John Doe</Table.Cell>
            <Table.Cell><Badge color="success">Completed</Badge></Table.Cell>
            <Table.Cell>$299.00</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Jane Smith</Table.Cell>
            <Table.Cell><Badge color="warning">Pending</Badge></Table.Cell>
            <Table.Cell>$149.00</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </Card>
    
    <Card>
      <h3 className="text-lg font-semibold mb-4">Project Progress</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Website Redesign</span>
            <span className="text-sm text-gray-500">75%</span>
          </div>
          <Progress progress={75} color="blue" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Mobile App</span>
            <span className="text-sm text-gray-500">45%</span>
          </div>
          <Progress progress={45} color="green" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">API Integration</span>
            <span className="text-sm text-gray-500">90%</span>
          </div>
          <Progress progress={90} color="purple" />
        </div>
      </div>
    </Card>
  </div>
</div>
```

#### E-commerce Product Grid
```typescript
import { Card, Button, Badge, Rating } from 'flowbite-react';
import { HiHeart, HiShoppingCart, HiEye } from 'react-icons/hi';

// ✅ Product grid with filters
<div className="space-y-6">
  {/* Filter Bar */}
  <Card>
    <div className="flex flex-wrap items-center gap-4">
      <Select className="min-w-[120px]">
        <option>All Categories</option>
        <option>Electronics</option>
        <option>Clothing</option>
        <option>Books</option>
      </Select>
      <Select className="min-w-[120px]">
        <option>Price: Low to High</option>
        <option>Price: High to Low</option>
        <option>Newest First</option>
        <option>Best Rating</option>
      </Select>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">Price Range:</span>
        <TextInput type="number" placeholder="Min" className="w-20" />
        <span className="text-gray-400">-</span>
        <TextInput type="number" placeholder="Max" className="w-20" />
      </div>
      <Button size="sm">Apply Filters</Button>
    </div>
  </Card>
  
  {/* Product Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {products.map((product) => (
      <Card key={product.id} className="group relative">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={product.image}
            alt={product.name}
            className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.isNew && (
            <Badge color="success" className="absolute top-2 left-2">
              New
            </Badge>
          )}
          {product.discount && (
            <Badge color="failure" className="absolute top-2 right-2">
              -{product.discount}%
            </Badge>
          )}
          
          {/* Hover Actions */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
            <Button size="sm" color="gray">
              <HiEye className="h-4 w-4" />
            </Button>
            <Button size="sm" color="gray">
              <HiHeart className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <h5 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white mb-2">
            {product.name}
          </h5>
          
          <div className="flex items-center mb-2">
            <Rating size="sm">
              {[...Array(5)].map((_, i) => (
                <Rating.Star key={i} filled={i < product.rating} />
              ))}
            </Rating>
            <span className="ml-2 text-sm text-gray-500">
              ({product.reviews})
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <Button size="sm">
              <HiShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </Card>
    ))}
  </div>
  
  {/* Pagination */}
  <div className="flex justify-center">
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      showIcons
    />
  </div>
</div>
```

## Component State Management

### Form State with Validation
```typescript
import { useState } from 'react';
import { TextInput, Label, Button, Alert } from 'flowbite-react';

interface FormErrors {
  [key: string]: string;
}

// ✅ Form with comprehensive validation
const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setErrors({ submit: 'Failed to send message. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-6">Contact Us</h3>
      
      {submitSuccess && (
        <Alert color="success" className="mb-4">
          Message sent successfully! We'll get back to you soon.
        </Alert>
      )}
      
      {errors.submit && (
        <Alert color="failure" className="mb-4">
          {errors.submit}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" value="Name" />
          <TextInput
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            color={errors.name ? 'failure' : 'gray'}
            helperText={errors.name}
          />
        </div>

        <div>
          <Label htmlFor="email" value="Email" />
          <TextInput
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            color={errors.email ? 'failure' : 'gray'}
            helperText={errors.email}
          />
        </div>

        <div>
          <Label htmlFor="subject" value="Subject" />
          <TextInput
            id="subject"
            type="text"
            value={formData.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            color={errors.subject ? 'failure' : 'gray'}
            helperText={errors.subject}
          />
        </div>

        <div>
          <Label htmlFor="message" value="Message" />
          <Textarea
            id="message"
            rows={4}
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            color={errors.message ? 'failure' : 'gray'}
            helperText={errors.message}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </Button>
      </form>
    </Card>
  );
};
```

## Performance Considerations

### Lazy Loading Components
```typescript
import { lazy, Suspense } from 'react';
import { Spinner, Card } from 'flowbite-react';

// ✅ Lazy load heavy components
const DataVisualization = lazy(() => import('./DataVisualization'));
const UserManagement = lazy(() => import('./UserManagement'));

const Dashboard: React.FC = () => (
  <div className="space-y-6">
    <Card>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      }>
        <DataVisualization />
      </Suspense>
    </Card>
    
    <Card>
      <Suspense fallback={
        <div className="flex justify-center items-center h-32">
          <Spinner size="lg" />
        </div>
      }>
        <UserManagement />
      </Suspense>
    </Card>
  </div>
);
```

### Memoized Components
```typescript
import { memo, useMemo } from 'react';
import { Card, Badge, Button } from 'flowbite-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

// ✅ Memoized product card
const ProductCard = memo<ProductCardProps>(({ 
  product, 
  onAddToCart, 
  onToggleFavorite 
}) => {
  const formattedPrice = useMemo(() => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(product.price),
    [product.price]
  );

  const discountedPrice = useMemo(() => 
    product.discount 
      ? product.price * (1 - product.discount / 100)
      : null,
    [product.price, product.discount]
  );

  return (
    <Card className="max-w-sm">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="h-48 w-full object-cover"
        />
        {product.isNew && (
          <Badge color="success" className="absolute top-2 right-2">
            New
          </Badge>
        )}
      </div>
      
      <h5 className="text-xl font-bold tracking-tight">
        {product.name}
      </h5>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold">
            {discountedPrice ? 
              new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(discountedPrice) : 
              formattedPrice
            }
          </span>
          {discountedPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formattedPrice}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            color="gray"
            onClick={() => onToggleFavorite(product.id)}
          >
            ♥
          </Button>
          <Button 
            size="sm"
            onClick={() => onAddToCart(product.id)}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
});
```
```