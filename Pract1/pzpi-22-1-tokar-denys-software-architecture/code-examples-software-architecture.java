// Amplifier.java
class Amplifier {
    public void on() { System.out.println("Підсилювач звуку увімкнено"); }
    public void setDvd(DvdPlayer dvd) { System.out.println("Джерело звуку: DVD"); }
    public void setVolume(int level) { System.out.println("Гучність: " + level); }
    public void off() { System.out.println("Підсилювач звуку вимкнено"); }
}
// DvdPlayer.java
class DvdPlayer {
    public void on() { System.out.println("DVD плеєр увімкнено"); }
    public void play(String movie) { System.out.println("Відтворення фільму: \"" + movie + "\""); }
    public void stop() { System.out.println("DVD: Стоп"); }
    public void eject() { System.out.println("DVD: Диск вилучено"); }
    public void off() { System.out.println("DVD плеєр вимкнено"); }
}
// Projector.java
class Projector {
    public void on() { System.out.println("Проектор увімкнено"); }
    public void wideScreenMode() { System.out.println("Проектор: широкоекранний режим"); }
    public void off() { System.out.println("Проектор вимкнено"); }
}
// Screen.java (Екран)
class Screen {
    public void down() { System.out.println("Екран опущено"); }
    public void up() { System.out.println("Екран піднято"); }
}
public class HomeTheaterFacade {
    private Amplifier amp;
    private DvdPlayer dvd;
    private Projector projector;
    private Screen screen;
    public HomeTheaterFacade(Amplifier amp, DvdPlayer dvd,
                             Projector projector, Screen screen) {
        this.amp = amp;
        this.dvd = dvd;
        this.projector = projector;
        this.screen = screen;
    }
    public void watchMovie(String movie) {
        System.out.println("\nГотуємось дивитись фільм...");
        screen.down();
        projector.on();
        projector.wideScreenMode();
        amp.on();
        amp.setDvd(dvd);
        amp.setVolume(5);
        dvd.on();
        dvd.play(movie);
    }    public void endMovie() {
        System.out.println("\nЗавершуємо перегляд фільму...");
        dvd.stop();
        dvd.eject();
        dvd.off();
        amp.off();
        projector.off();
        screen.up();
    }
}
public class Client {
    public static void main(String[] args) {
        // Ініціалізація компонентів підсистеми
        Amplifier amp = new Amplifier();
        DvdPlayer dvd = new DvdPlayer();
        Projector projector = new Projector();
        Screen screen = new Screen();
        // Створення Фасаду
        HomeTheaterFacade homeTheater = new HomeTheaterFacade(
                                            amp, dvd, projector, screen);
        // Використання Фасаду
        homeTheater.watchMovie("Інтерстеллар");
        homeTheater.endMovie();
    }
}




