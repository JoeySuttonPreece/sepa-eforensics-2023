import pytsk3
import tkinter as tk
import platform
window = tk.Tk()
version = tk.Label(
        text=f'pytsk3 version {pytsk3.get_version()}',
        font=("Arial", 16)
        ).pack()
operating_system = tk.Label(
        text=f'running on {platform.platform()}',
        font=('Arial', 16)
        ).pack()

button = tk.Button(
        text='A Button',
        font=('Arial', 16)
        ).pack()

window.mainloop()