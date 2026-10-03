## Nortek Bluebolt

**Available commands for Bluebolt** (Depends on module connected)

- Power on/off/cycle/toggle bank
- Sequence on/off
- Reboot
- Set Bank Delay
- Reftesh Info
- Refresh Settings
- Enumerate
- Roll Call
- Set Bank Trigger
- Set Brightness

The Nice M4320-PRO uses Telnet on port 23 and does not require a Device ID.
It supports all documented control and configuration commands, device queries,
live variables, and feedbacks for outlet, power, fault, and trigger status.

**Available variables for Bluebolt** (Depends on module connected)

- Current Voltage
- Current Amperage
- Current Wattage
- Current VA
- Current Power Factor
- Bank Power Status
- Remote Sensing
- Surge Protection OK
- Series Mode Protection state
- Smartlink OK
- Power Status
- Squence Status
- Trigger Status

**Available feedback for Bluebolt** (Depends on module connected)

- Bank Power Status
- Remote Sensing
- Surge Protection OK
- Series Mode Protection power relay state
- Smartlink OK
- Power Status
- Squence Status

**Available presets for Bluebolt** (UDP models with power variables)

- Toggle Bank 1..N (per-bank, requires polling to be enabled)
- Built-in Bank Power Status feedback styling (green when bank is ON)

**Available presets for M4320-PRO**

- Outlet 1–8 toggle, on, off, and 30-second cycle buttons
- All on/off, green sequence, Reboot 1/2, and status refresh
- Profile 1–4 selection with active-profile highlighting
- Power, breaker, wiring, temperature, AVM, and DC trigger indicators
