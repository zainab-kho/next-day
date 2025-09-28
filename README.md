# Next Day

Next Day is a desktop productivity app designed to make daily planning simple and visually engaging. Built with Electron, HTML, CSS, and JavaScript, it allows users to set start and end dates, track progress with either countdowns or count-ups, and manage customizable daily goals. Features include rest days, pixel-style themes, and a progress bar that updates dynamically as goals are completed. The project is packaged using Electron Packager and @electron/universal, making it cross-platform and easy to run on different systems.

---

## Features
- Set a start and end date, then track progress by counting up or down  
- Add daily goals and check them off as you complete them  
- Take optional rest days when needed  
- Choose from multiple color themes (blue, green, pink, yellow, purple, turquoise)  
- View progress with a dynamic progress bar and percentage updates  
- Enjoy custom pixel-style window controls (minimize/close)  

---

## Screenshots
### Setup
<img width="400" height="500" alt="image" src="https://github.com/user-attachments/assets/434abad8-919f-46e4-acba-7584824503d8" />

<img width="400" height="500" alt="image" src="https://github.com/user-attachments/assets/ed71302b-2d97-4a36-a2b5-1025ebf5fc5a" />



### Counter / Goals View
<img width="400" height="500" alt="image" src="https://github.com/user-attachments/assets/939eff33-d17f-4b44-bc0c-031929a6b62b" />


---

## Getting Started

### Prerequisites
- [node.js](https://nodejs.org/) (>=16)  
- [npm](https://www.npmjs.com/)  

### Installation & run
```bash
git clone https://github.com/zainab-kho/next-day.git
cd next-day
npm install
npm start
```

### Build
To build the app locally:

```bash
npx electron-packager . NextDay --platform=darwin --arch=x64,arm64 --out=dist
npx electron-universal dist/NextDay-darwin-x64 NextDay-darwin-arm64 NextDay-universal
```

---
## License
This project is licensed under the MIT license.
