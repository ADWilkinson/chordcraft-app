# ChordCraft UI Kit

This is a customized UI kit for the ChordCraft application, inspired by the Catalyst UI kit and built with [Tailwind CSS](https://tailwindcss.com) and [React](https://react.dev/).

## Components

The UI kit includes the following components:

- **alert.tsx**: For displaying notifications and alerts to the user
- **button.tsx**: Button components with various styles and variants
- **card.tsx**: Card components for content display
- **dialog.tsx**: Modal dialog components
- **divider.tsx**: Horizontal and vertical dividers
- **dropdown.tsx**: Dropdown menu components
- **fieldset.tsx**: Form field containers and labels
- **heading.tsx**: Typography components for headings
- **input.tsx**: Text input components
- **link.tsx**: Link components with various styles
- **navbar.tsx**: Navigation bar components
- **select.tsx**: Dropdown select components
- **spinner.tsx**: Loading spinners
- **text.tsx**: Typography components for body text
- **textarea.tsx**: Multiline text input components
- **toast.tsx**: Toast notification components

## Usage

Import components from the ui-kit folder:

```jsx
import { Button } from '../components/ui-kit/button'
import { Input } from '../components/ui-kit/input'
import { Card } from '../components/ui-kit/card'
```

Example usage:

```jsx
import { Button } from '../components/ui-kit/button'
import { Card } from '../components/ui-kit/card'
import { Input } from '../components/ui-kit/input'
import { Field, FieldGroup, Label } from '../components/ui-kit/fieldset'

export default function GeneratorForm() {
  return (
    <Card>
      <form>
        <FieldGroup>
          <Field>
            <Label>Key</Label>
            <Input name="key" />
          </Field>
          <Field>
            <Label>Scale</Label>
            <Input name="scale" />
          </Field>
          <Button type="submit">Generate</Button>
        </FieldGroup>
      </form>
    </Card>
  )
}
```

## Dependencies

These components rely on the following dependencies:

```sh
npm install @headlessui/react framer-motion clsx
```

## Customization

The components are designed to be customized with Tailwind CSS. You can modify the styling by:

1. Editing the component files directly
2. Using the `className` prop to override styles
3. Modifying the Tailwind configuration

## Accessibility

All components are built with accessibility in mind:

- Proper ARIA attributes
- Keyboard navigation support
- Proper focus management
- Color contrast compliance

## License

This UI kit is part of the ChordCraft project and is licensed under the MIT License.