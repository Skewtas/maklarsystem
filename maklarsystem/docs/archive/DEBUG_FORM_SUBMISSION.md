# Form Submission Debug Guide

## Issues Fixed

1. **Field Mapping**: Updated the `onSubmit` function in `/src/app/nytt/page.tsx` to properly map form fields to database fields:
   - `lang_beskrivning` or `kort_beskrivning` → `beskrivning`
   - `antal_rum` → `rum`
   - `byggar` → `byggaar`
   - `upplatelse_form` → `agandekategori`
   - `avgift_manad` → `avgift`
   - `driftkostnad_manad` → `driftkostnad`

2. **Postal Code Format**: The form now removes spaces from postal codes before sending to API

3. **Required Field**: Added `required` prop to the `kommun` field in `GrundinformationSection.tsx`

4. **Validation**: Re-enabled Zod validation in the form

## Required Fields for Successful Submission

According to the validation schema, these fields are REQUIRED:
- `sokbegrepp` - Search term
- `typ` - Property type (villa, lagenhet, etc.)
- `adress` - Street address
- `postnummer` - Postal code (format: XXX XX)
- `ort` - City
- `kommun` - Municipality

## Things to Check

1. **Console Errors**: Check browser console for specific validation errors when submitting

2. **User Authentication**: Ensure user is properly logged in and `user.id` is available

3. **Default Values**: The form sets default values, but ensure all required fields are actually filled before submission

4. **API Response**: Check the Network tab in browser DevTools to see the actual API request and response

## Testing Steps

1. Fill in all required fields:
   - Sökbegrepp: "Test objekt"
   - Typ: Select any option
   - Adress: "Testgatan 1"
   - Postnummer: "123 45"
   - Ort: "Stockholm"
   - Kommun: "Stockholm"

2. Submit the form and check:
   - Console logs for "Form data received" and "API data to send"
   - Any validation errors
   - Network tab for API call details

3. If still failing, check the API response for specific error messages

## Additional Debug Info

The form logs these in console:
- `Form data received:` - Shows all form data
- `Form validation errors:` - Shows any validation errors
- `API data to send:` - Shows transformed data being sent to API
- Error details including userId and full error object