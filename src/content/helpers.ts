export class Helpers {
	static injectScript(scriptText: string): void {
		const script = document.createElement('script'),
			  target = document.getElementsByTagName('script')[0] as HTMLElement;

		script.type  = "text/javascript";
		script.text  = scriptText;

		target.parentNode.insertBefore(script, target);
	}
}
