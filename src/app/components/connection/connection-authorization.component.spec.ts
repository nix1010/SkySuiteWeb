import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionAuthorizationComponent } from './connection-authorization.component';

describe('OAuth2AuthrorizationComponent', () => {
  let component: ConnectionAuthorizationComponent;
  let fixture: ComponentFixture<ConnectionAuthorizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectionAuthorizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectionAuthorizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
