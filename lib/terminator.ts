import { exec } from "child_process";

/**
 * Executes a desktop action using Terminator.
 * @param action The action to execute (e.g., "summarizeEmails", "findCustomerInteractions").
 */
export async function executeDesktopAction(action: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let command = "";

    // Map actions to Terminator commands
    switch (action) {
      case "summarizeEmails":
        command = "terminator summarize-emails"; // Replace with actual Terminator command
        break;
      case "findCustomerInteractions":
        command = "terminator find-customer-interactions"; // Replace with actual Terminator command
        break;
      default:
        return reject(new Error(`Unknown action: ${action}`));
    }

    // Execute the command
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${stderr}`);
        return reject(error);
      }

      console.log(`Command output: ${stdout}`);
      resolve();
    });
  });
}