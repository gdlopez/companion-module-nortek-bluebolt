exports.updateVariables = function () {
  if (this.model.id == "m4320") {
    const variables = {
      vendor: { name: "Manufacturer" },
      device_model: { name: "Device Model" },
      firmware: { name: "Firmware Revision" },
      voltage: { name: "Line Voltage (V)" },
      current: { name: "Current Draw (A)" },
      power_status: { name: "Power Status" },
      breaker: { name: "Breaker Status" },
      wire_fault: { name: "Wiring Fault Status" },
      temperature: { name: "Temperature Status" },
      avm: { name: "AVM Status" },
      trigger_input: { name: "DC Trigger Input" },
      green_mode: { name: "Green Mode" },
      feedback_mode: { name: "Feedback Mode" },
      linefeed_mode: { name: "Linefeed Mode" },
      profile: { name: "Selected Profile" },
      reboot1_delay: { name: "Reboot 1 Delay (seconds)" },
      reboot2_delay: { name: "Reboot 2 Delay (seconds)" },
      last_event: { name: "Last Device Event" },
      last_message: { name: "Last Device Message" },
    };

    for (let outlet = 1; outlet <= this.model.banks; outlet++) {
      variables[`outlet${outlet}`] = { name: `Outlet ${outlet} Status` };
      variables[`outlet${outlet}_trigger`] = {
        name: `Outlet ${outlet} Trigger Source`,
      };
      variables[`outlet${outlet}_on_delay`] = {
        name: `Outlet ${outlet} On Delay (seconds)`,
      };
      variables[`outlet${outlet}_off_delay`] = {
        name: `Outlet ${outlet} Off Delay (seconds)`,
      };
    }

    this.setVariableDefinitions(variables);
    return;
  }

  if (this.model.variables) {
    var variables = {};
    if (this.model.variables.power === true) {
      variables.voltage = { name: "Current Voltage" };
      variables.amperage = { name: "Current Amperage" };
      variables.wattage = { name: "Current Wattage" };
      variables.pwrva = { name: "Current VA" };
      variables.pwrfact = { name: "Current Power Factor" };
      if (this.model.banks > 0) {
        for (let i = 0; i < this.model.banks; i++) {
          variables[`bank${i + 1}`] = {
            name: `Bank ${i + 1} Status`,
          };
        }
      }
      if (this.model.smartlink === true) {
        variables.remote = { name: "Remote Sensing input" };
        variables.protok = { name: "Surge protection OK" };
        variables.smp = { name: "Series Mode Protection state" };
        variables.secok = { name: "Secondary SmartLink OK" };
        variables.overvolt = { name: "Overvoltage" };
        variables.undervolt = { name: "Undervoltage" };
        variables.pwrok = { name: "Power OK" };
        variables.seqprog = { name: "Currently Sequencing" };
      } else {
        variables.seq = { name: "Sequence Status" };
        variables.pwrcond = { name: "Power Status" };
        variables.wiringfault = { name: "Wiring Fault" };
      }
    }
    if (this.model.variables.trigger === true) {
      variables.triggersense = { name: "Trigger Connected" };
      variables.trigger = { name: "Triggered" };
    }
    this.setVariableDefinitions(variables);
  }
};
