import { Entity } from 'aframe';
import { state } from '../systems/state';
import { Light } from '../types';
import option from '../settings/light.json';

export class Flash {
  private readonly FLASH_CONSUME_SPEED = 0.1;
  private readonly FLASH_CHARGE_SPEED = 0.01;
  private $el = document.createElement('a-light');

  constructor($parentEl: Entity) {
    const lightOption = option as { [key: string]: any };

    Object.keys(lightOption).forEach((key) => {
      this.$el.setAttribute(key, lightOption[key]);
    });

    $parentEl.appendChild(this.$el);
  }

  private chargeBattery() {
    const $battery = document.querySelector('.battery');
    const { flash } = state;
    requestAnimationFrame(
      function chargeBattery() {
        flash.battery = Math.min(flash.battery + this.FLASH_CHARGE_SPEED, 100);
        $battery.style.width = `${flash.battery}%`;
        !flash.isOn && flash.battery < 100 && requestAnimationFrame(chargeBattery.bind(this));
      }.bind(this)
    );
  }

  private consumeBattery() {
    const $battery = document.querySelector('.battery');
    const { flash } = state;
    requestAnimationFrame(
      function comsumeBattery() {
        flash.battery = Math.max(flash.battery - this.FLASH_CONSUME_SPEED, 0);
        $battery.style.width = `${flash.battery}%`;
        flash.isOn && requestAnimationFrame(comsumeBattery.bind(this));
        if (flash.battery === 0) {
          flash.isOn = false;
          this.$el.setAttribute('intensity', Light.Off);
          this.chargeBattery();
        }
      }.bind(this)
    );
  }

  turnOff() {
    this.$el.setAttribute('intensity', Light.Off);
    this.chargeBattery();
  }

  turnOn() {
    const { flash } = state;

    if (flash.battery < 1) {
      flash.isOn = !flash.isOn;
      return;
    }
    this.$el.setAttribute('intensity', Light.On);
    this.consumeBattery();
  }
  // for test
  chargeFull() {
    const $battery = document.querySelector('.battery');
    state.flash.battery = 100;
    $battery.style.width = `${state.flash.battery}%`;
  }
}